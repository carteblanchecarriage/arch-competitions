import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900">
                <span className="text-xs font-bold text-white">A</span>
              </div>
              <span className="font-semibold text-gray-900">Arch Competitions</span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Transparent, fair architecture competitions. Free to submit. Free to create. Always.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Platform</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/competitions" className="text-sm text-gray-500 hover:text-gray-900">Browse Competitions</Link></li>
              <li><Link href="/create" className="text-sm text-gray-500 hover:text-gray-900">Create a Competition</Link></li>
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Principles</h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-gray-500">Free to submit, always</li>
              <li className="text-sm text-gray-500">Transparent prize pools</li>
              <li className="text-sm text-gray-500">Designers own their work</li>
              <li className="text-sm text-gray-500">5% platform fee at payout</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Stay Updated</h3>
            <p className="mt-3 text-sm text-gray-500">
              Newsletter coming soon. Follow new competitions as they launch.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Arch Competitions. Built with transparency.
        </div>
      </div>
    </footer>
  );
}
