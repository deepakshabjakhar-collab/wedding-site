import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Share2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export function ShareDialog({
  open,
  onClose,
  url,
  title,
  description,
  guestName,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description: string;
  guestName?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, text: description, url });
    } catch {
      /* dismissed */
    }
  };

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    `${guestName ? `${guestName}, ` : ''}${description} ${url}`,
  )}`;

  return (
    <Modal open={open} onClose={onClose} title="Share the invitation" description={guestName ? `Personal link for ${guestName}` : undefined} size="sm">
      <div className="flex flex-col items-center gap-5">
        <div className="rounded-xl border border-line bg-paper p-3 shadow-sm">
          <QRCodeSVG value={url} size={150} bgColor="#fffdf8" fgColor="#211b16" level="M" />
        </div>
        <p className="text-center text-xs leading-relaxed text-muted">
          Scan to open, or send the link directly. {guestName ? 'This link is personal to their household.' : 'Anyone with this link can open the invitation.'}
        </p>
        <div className="flex w-full items-stretch gap-2">
          <input readOnly value={url} className="input min-w-0 flex-1 text-xs" aria-label="Invitation link" onFocus={(e) => e.currentTarget.select()} />
          <button type="button" onClick={copy} className="btn btn-outline btn-sm flex-none" aria-label="Copy link">
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="grid w-full grid-cols-2 gap-2">
          <a href={whatsapp} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
            WhatsApp
          </a>
          <button
            type="button"
            onClick={() => void nativeShare()}
            className="btn btn-outline btn-sm"
            disabled={!navigator.share}
          >
            <Share2 size={13} /> Share…
          </button>
        </div>
      </div>
    </Modal>
  );
}
