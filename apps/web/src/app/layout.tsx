import type { Metadata } from 'next';
import { Bricolage_Grotesque, Young_Serif } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-bricolage',
});

const youngSerif = Young_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-young-serif',
});

export const metadata: Metadata = {
  title: 'Burger da Vó',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${bricolageGrotesque.variable} ${youngSerif.variable}`}>
      <body>
        <div className="mx-auto max-w-md">{children}</div>
      </body>
    </html>
  );
}
