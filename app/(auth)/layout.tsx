import Image from "next/image";

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <main className="flex min-h-screen w-ful justify-between font-inter">
          {children}
          <div className="auth-asset">
            <div>
              <Image 
                src={'/icons/auth-image.svg'}
                alt="auth image"
                width={1000}
                height={3000}
              />
            </div>
          </div>
      </main>
    );
  }
  