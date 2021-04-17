# Maintainer: ransome1 <ransome@uber.space>
pkgname=sleek-bin
pkgver=@VERSION@
pkgrel=1
pkgdesc="Todo app based on the todo.txt format for Linux, free and open-source"
arch=('x86_64')
url="https://github.com/ransome1/sleek/"
license=("MIT")
# depends=(openssl zlib libxcb alsa-lib)
provides=(sleek)
conflicts=(sleek-git)
# source=("https://github.com/ruffle-rs/ruffle/releases/download/nightly-${pkgver//./-}/ruffle_nightly_${pkgver//./_}_linux.tar.gz")
source=("https://github.com/ransome1/sleek/archive/refs/tags/${pkgver//./-}.tar.gz")

sha512sums=('SKIP')

package() {
	cd "$srcdir/"
	install -Dm755 -t "$pkgdir/usr/bin/" sleek
	install -Dm644 -t "$pkgdir/usr/share/doc/$pkgname/" README.md
	install -Dm644 -t "$pkgdir/usr/share/licenses/$pkgname/" LICENSE_*
}
