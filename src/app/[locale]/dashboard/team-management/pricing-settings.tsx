'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { teamManagementApi } from '@/api/team-management';

type PlanConfig = {
  code: string;
  name: string;
  defaultPrice: string;
};

const PLAN_CONFIGS: PlanConfig[] = [
  { code: 'vip', name: 'VIP', defaultPrice: '' },
  { code: 'vip_plus', name: 'VIP Plus', defaultPrice: '' },
  { code: 'vip_pro', name: 'VIP Pro', defaultPrice: '' },
  { code: 'team_manager_upgrade', name: '团队管理权限', defaultPrice: '' },
];

export function PricingSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const res = await teamManagementApi.getTeamOverrides();
      const newPrices: Record<string, string> = {};
      if (Array.isArray(res)) {
        res.forEach(item => {
          newPrices[item.plan_code] = item.month_price;
        });
      }
      setPrices(newPrices);
    } catch (error: any) {
      toast.error(error.message || '获取价格设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (code: string, value: string) => {
    setPrices(prev => ({ ...prev, [code]: value }));
  };

  const handleSave = async (code: string) => {
    const price = prices[code];
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      toast.error('请输入有效的价格');
      return;
    }

    setSaving(code);
    try {
      await teamManagementApi.updateTeamOverride(code, price);
      toast.success('价格设置已保存');
    } catch (error: any) {
      toast.error(error.message || '保存失败，请重试');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-none">
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>套餐价格设置</CardTitle>
        <CardDescription>
          设置下级工作室可见的各会员套餐及升级价格。如果不设置，将使用平台默认价格。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLAN_CONFIGS.map(plan => (
            <div key={plan.code} className="space-y-3 rounded-lg border p-4">
              <div className="font-medium">{plan.name}</div>
              <div className="space-y-1.5">
                <Label htmlFor={`price-${plan.code}`} className="text-xs text-muted-foreground">
                  自定义价格 (USDT)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={`price-${plan.code}`}
                    placeholder="未设置 (默认价)"
                    value={prices[plan.code] || ''}
                    onChange={(e) => handlePriceChange(plan.code, e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                  />
                  <Button 
                    variant="default"
                    onClick={() => handleSave(plan.code)}
                    disabled={saving === plan.code}
                  >
                    {saving === plan.code ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中
                      </>
                    ) : (
                      '保存'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
