import type { Metadata } from 'next';
import './globals.scss';
export const metadata: Metadata = {
  title: 'Tushar Singour — Developer & Builder',
  description: 'The portfolio of Tushar Singour, a B.Tech CSE student exploring full-stack development, Java, DSA, and practical software projects.',
  openGraph: { title: 'Tushar Singour — Developer & Builder', description: 'Building useful things, one iteration at a time.', type: 'website' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
