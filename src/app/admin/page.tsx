import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site/SiteFooter';
import { Wordmark } from '../_ui';
import { LoginForm } from './LoginForm';
import { SitePhoto } from '@/components/site/SitePhoto';

/* ============================================================================
 * 店舗スタッフのログイン `/admin`。
 * 左に施術室の面、右にログイン（書き出しと同じ割り）。
 * ==========================================================================*/

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'ログイン — éto 店舗管理',
    description:
      'éto の店舗スタッフ用管理画面のログイン。見本のため入力は照合されず、どこにも送られません。',
    alternates: { canonical: '/admin' },
    robots: { index: false, follow: false },
  };
}

export default async function EtoAdminLoginPage() {

  return (
    <>
      <div className="sample-body sample-eto md:flex md:min-h-screen">
        {/* 左：施術室の面 */}
        <SitePhoto
          src="eto/room"
          width={1000}
          height={667}
          eager
          className="eto-room min-h-[200px] md:min-h-screen md:w-[48%]"
        />

        {/* 右：ログイン */}
        <main
          id="main"
          className="flex flex-1 flex-col justify-center bg-[var(--cream)] px-6 py-14 md:px-12"
        >
          <div className="w-full max-w-[440px]">
            <Wordmark size="lg" />
            <span className="sr-only">éto 店舗管理</span>
            <p className="mt-2 text-[13px] text-[var(--sub)]">店舗管理</p>
            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
