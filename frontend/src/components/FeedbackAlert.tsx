import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

type FeedbackAlertType = 'error' | 'success' | 'info';

interface FeedbackAlertProps {
    message?: string | null;
    type?: FeedbackAlertType;
    onClose?: () => void;
    className?: string;
}

const feedbackStyles: Record<FeedbackAlertType, string> = {
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-green-200 bg-green-50 text-green-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
};

const feedbackIcons = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
};

export const FeedbackAlert = ({
    message,
    type = 'error',
    onClose,
    className = '',
}: FeedbackAlertProps) => {
    if (!message) return null;

    const Icon = feedbackIcons[type];

    return (
        <div
            role={type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`flex items-start gap-3 rounded-xl border p-4 ${feedbackStyles[type]} ${className}`}
        >
            <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-1 opacity-70 transition hover:bg-white/60 hover:opacity-100"
                    aria-label="Tutup pesan"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};
