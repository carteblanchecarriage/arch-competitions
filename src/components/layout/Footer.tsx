import Link from 'next/link';

export function Footer() {
  return (
    <footer className='border-t border-gray-200 bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid gap-8 sm:grid-cols-3'>
          <div>
            <div className='flex items-center gap-2'>
              <span className='font-bold italic text-gray-900'>
                Counterparti
              </span>
            </div>
            <p className='mt-3 text-sm text-gray-500'>
              Transparent, fair architecture competitions. Free to submit. Free
              to create. Always.
            </p>
            <a
              href='https://discord.gg/aDehzu9U5B'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Join our Discord'
              className='mt-4 inline-flex h-8 w-8 items-center justify-center text-gray-400 transition-colors hover:text-gray-900'
            >
              <svg viewBox='0 0 24 24' fill='currentColor' className='h-5 w-5'>
                <path d='M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c1.9917 1.4634 3.9214 2.3557 5.8171 2.9464a.0777.0777 0 0 0 .0842-.0276c.4482-.6122.8479-1.2585 1.1913-1.9384a.076.076 0 0 0-.0416-.1057c-.6328-.2394-1.2346-.5317-1.8137-.8659a.077.077 0 0 1-.0076-.1277c.1219-.0914.2437-.1866.3598-.2827a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1162.0961.238.1922.3607.2837a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8919.0766.0766 0 0 0-.0407.1067c.3568.6817.7648 1.3226 1.2039 1.9317a.076.076 0 0 0 .0842.0286c1.9033-.5905 3.833-1.4828 5.8154-2.9464a.077.077 0 0 0 .0313-.055c.4998-5.177-.8352-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286ZM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189Zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z' />
              </svg>
            </a>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-gray-900'>Platform</h3>
            <ul className='mt-3 space-y-2'>
              <li>
                <Link
                  href='/competitions'
                  className='text-sm text-gray-500 hover:text-gray-900'
                >
                  Browse Competitions
                </Link>
              </li>
              <li>
                <Link
                  href='/create'
                  className='text-sm text-gray-500 hover:text-gray-900'
                >
                  Create a Competition
                </Link>
              </li>
              <li>
                <Link
                  href='/about'
                  className='text-sm text-gray-500 hover:text-gray-900'
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href='/blog'
                  className='text-sm text-gray-500 hover:text-gray-900'
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href='/faq'
                  className='text-sm text-gray-500 hover:text-gray-900'
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href='/docs'
                  className='text-sm text-gray-500 hover:text-gray-900'
                >
                  Developer Docs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-gray-900'>
              Stay Updated
            </h3>
            <p className='mt-3 text-sm text-gray-500'>
              Newsletter coming soon. Follow new competitions as they launch.
            </p>
          </div>
        </div>

        <div className='mt-10 flex flex-col items-center gap-3 border-t border-gray-200 pt-6 text-center text-xs text-gray-400 sm:flex-row sm:justify-between sm:text-left'>
          <span>
            &copy; {new Date().getFullYear()} Counterparti. Built with
            transparency.
          </span>
          <span className='flex gap-4'>
            <Link href='/terms' className='hover:text-gray-600'>
              Terms of Service
            </Link>
            <Link href='/privacy' className='hover:text-gray-600'>
              Privacy Policy
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
