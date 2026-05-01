'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (loading) return null;

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-2 rounded-full transition-colors active:scale-95 min-h-[44px]"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        로그인
      </button>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const name = (user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? user.email?.split('@')[0];

  return (
    <div className="flex items-center gap-2">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full border-2 border-white/40" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold text-white">
          {name?.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-white/90 text-xs font-medium hidden sm:block">{name}</span>
      <button
        onClick={async () => { setSigningOut(true); await signOut(); setSigningOut(false); }}
        disabled={signingOut}
        className="text-white/60 hover:text-white text-xs transition-colors active:scale-95 px-2 py-1"
        title="로그아웃"
      >
        {signingOut ? '...' : '로그아웃'}
      </button>
    </div>
  );
}
