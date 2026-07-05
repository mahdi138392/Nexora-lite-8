import React from 'react';
import { AVATAR_OPTIONS, avatarUrl } from '../../lib/avatars';

interface AvatarPickerModalProps {
  avatarId: string | null | undefined;
  onClose: () => void;
  onSelect: (avatarId: string) => void;
}

const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({ avatarId, onClose, onSelect }) => (
  <div
    className="fixed inset-0 z-[90] flex items-center justify-center p-4"
    style={{ backgroundColor: 'rgba(9,7,5,0.9)', backdropFilter: 'blur(4px)' }}
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="avatar-picker-title"
  >
    <div
      className="bg-card rounded-2xl p-6 max-w-sm w-full"
      style={{ border: '1px solid rgba(216,140,58,0.2)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 id="avatar-picker-title" className="text-lg font-bold text-text-primary mb-4 text-center">
        Choose Your Avatar
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {AVATAR_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`rounded-xl p-1.5 transition-all ${
              avatarId === opt.id
                ? 'border-2 border-brand-purple bg-brand-purple/10'
                : 'border-2 border-transparent bg-secondary-layer hover:border-brand-purple/40'
            }`}
          >
            <img src={avatarUrl(opt.id)} alt={opt.label} className="w-full rounded-lg" />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-full mt-5 py-2.5 bg-secondary-layer text-text-primary rounded-xl text-sm font-medium"
      >
        Cancel
      </button>
    </div>
  </div>
);

export default AvatarPickerModal;
