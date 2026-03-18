import Image from 'next/image';

interface ChannelLogoProps {
  type: string;
}

const logoMap: Record<string, string> = {
  'smtp_email': '/channel_logo/mail.svg',
  'telegram_bot': '/channel_logo/telegram.svg',
  'dingtalk_bot': '/channel_logo/dingding.svg',
  'qq_email': '/channel_logo/QQmail.svg',
};

export function ChannelLogo({ type }: ChannelLogoProps) {
  const src = logoMap[type] || '/channel_logo/mail.svg';

  return (
    <div className="bg-background p-2 rounded-md border">
      <Image
        src={src}
        alt={`${type} logo`}
        width={20}
        height={20}
        className="h-5 w-5"
      />
    </div>
  );
}
