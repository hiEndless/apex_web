'use client';

import { useEffect, useState } from 'react';

import { ChevronDownIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function timeFromDate(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function msPairToState(
  startMs: string,
  endMs: string,
): { range: DateRange; startT: string; endT: string } | null {
  const a = startMs.trim();
  const b = endMs.trim();
  // 注意：Number('') === 0，空串会被当成 epoch，必须先判空
  if (!a || !b) return null;
  const s = Number(a);
  const e = Number(b);
  if (!Number.isFinite(s) || !Number.isFinite(e)) return null;
  if (s <= 0 || e <= 0) return null;
  const from = new Date(s);
  const to = new Date(e);
  return {
    range: { from, to },
    startT: timeFromDate(from),
    endT: timeFromDate(to),
  };
}

function normalizeTimeFromInput(v: string): string {
  if (!v) return '00:00:00';
  const p = v.split(':');
  if (p.length === 2) return `${p[0]}:${p[1]}:00`;
  if (p.length >= 3) return `${p[0]}:${p[1]}:${p[2]}`;
  return '00:00:00';
}

function toTimeInputValue(t: string): string {
  const parts = t.split(':');
  const h = pad2(Number.parseInt(parts[0] ?? '0', 10) || 0);
  const m = pad2(Number.parseInt(parts[1] ?? '0', 10) || 0);
  const s = pad2(Number.parseInt(parts[2] ?? '0', 10) || 0);
  return `${h}:${m}:${s}`;
}

function combineToMs(from: Date, to: Date, startT: string, endT: string): { start: string; end: string } {
  const parseParts = (t: string) => {
    const parts = t.split(':').map((x) => parseInt(x, 10));
    const h = Number.isFinite(parts[0]) ? parts[0] : 0;
    const m = Number.isFinite(parts[1]) ? parts[1] : 0;
    const s = Number.isFinite(parts[2]) ? parts[2] : 0;
    return { h, m, s };
  };
  const st = parseParts(startT);
  const et = parseParts(endT);
  const ds = new Date(from);
  ds.setHours(st.h, st.m, st.s, 0);
  const de = new Date(to);
  de.setHours(et.h, et.m, et.s, 0);
  return { start: String(ds.getTime()), end: String(de.getTime()) };
}

export type DateTimeRangePickerProps = {
  /** 开始时间戳（毫秒），空字符串表示未选 */
  valueStart: string;
  /** 结束时间戳（毫秒） */
  valueEnd: string;
  onChange: (startMs: string, endMs: string) => void;
  className?: string;
  /** 触发按钮样式（与筛选区一致时可传入） */
  triggerClassName?: string;
};

/**
 * 日期 + 时间范围选择（起止均为本地时区），对外值为 Unix 毫秒字符串，供接口查询使用。
 */
export function DateTimeRangePicker({
  valueStart,
  valueEnd,
  onChange,
  className,
  triggerClassName,
}: DateTimeRangePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('23:59:59');

  useEffect(() => {
    const vs = valueStart.trim();
    const ve = valueEnd.trim();
    if (!vs && !ve) {
      setRange(undefined);
      setStartTime('00:00:00');
      setEndTime('23:59:59');
      return;
    }
    const parsed = msPairToState(vs, ve);
    if (parsed) {
      setRange(parsed.range);
      setStartTime(parsed.startT);
      setEndTime(parsed.endT);
    } else {
      setRange(undefined);
    }
  }, [valueStart, valueEnd]);

  const emit = (r: DateRange | undefined, st: string, et: string) => {
    if (!r?.from || !r.to) {
      onChange('', '');
      return;
    }
    const { start, end } = combineToMs(r.from, r.to, st, et);
    onChange(start, end);
  };

  const summary =
    range?.from && range?.to
      ? `${range.from.toLocaleDateString()} ${startTime.slice(0, 5)} — ${range.to.toLocaleDateString()} ${endTime.slice(0, 5)}`
      : '选择日期与时间';

  return (
    <div className={cn('space-y-1', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            className={cn(
              'h-8 w-full justify-between text-xs font-normal shadow-none focus-visible:ring-0',
              triggerClassName,
            )}
          >
            <span className='truncate text-left'>{summary}</span>
            <ChevronDownIcon className='size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          sideOffset={6}
          className='w-auto max-w-[min(100vw-1rem,18.5rem)] overflow-hidden rounded-md border border-border bg-popover p-0 shadow-none outline-none'
        >
          <Calendar
            mode='range'
            className='p-2 [--cell-size:1.75rem]'
            showOutsideDays={false}
            selected={range}
            onSelect={(r) => {
              setRange(r);
              if (!r) {
                onChange('', '');
                return;
              }
              if (r.from && r.to) {
                emit(r, startTime, endTime);
              }
            }}
          />
          <div className='flex flex-col gap-2 border-t border-border/60 bg-muted/20 px-2.5 py-2'>
            <div className='flex items-center gap-2 text-xs'>
              <span className='w-9 shrink-0 text-muted-foreground'>开始</span>
              <Input
                type='time'
                step={1}
                value={toTimeInputValue(startTime)}
                onChange={(e) => {
                  const full = normalizeTimeFromInput(e.target.value);
                  setStartTime(full);
                  if (range?.from && range?.to) emit(range, full, endTime);
                }}
                className='h-7 min-w-0 flex-1 border-border/80 text-xs shadow-none focus-visible:ring-0'
              />
            </div>
            <div className='flex items-center gap-2 text-xs'>
              <span className='w-9 shrink-0 text-muted-foreground'>结束</span>
              <Input
                type='time'
                step={1}
                value={toTimeInputValue(endTime)}
                onChange={(e) => {
                  const full = normalizeTimeFromInput(e.target.value);
                  setEndTime(full);
                  if (range?.from && range?.to) emit(range, startTime, full);
                }}
                className='h-7 min-w-0 flex-1 border-border/80 text-xs shadow-none focus-visible:ring-0'
              />
            </div>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-7 text-xs text-muted-foreground hover:text-foreground'
              onClick={() => {
                setRange(undefined);
                setStartTime('00:00:00');
                setEndTime('23:59:59');
                onChange('', '');
              }}
            >
              清除
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DateTimeRangePicker;
