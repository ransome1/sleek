# Maintainer: ransome1 <ransome@uber.space>
pkgname="sleek"
pkgver=0.9.9
pkgrel=1
epoch=1
pkgdesc="Todo app based on the todo.txt format for Linux, free and open-source"
arch=("x86_64")
url="https://github.com/ransome1/sleek/"
license=("MIT")
provides=("sleek")
options=(!strip)
depends=("electron12")
makedepends=("npm")
#source=("https://github.com/ransome1/sleek/archive/refs/tags/v${pkgver}.tar.gz")
#source=("v${pkgver}.tar.gz")
source=("https://github.com/ransome1/sleek.git")
# md5sums=("998485e4eeb3b7e1fbe54b64a79d28d0")
sha512sums=("SKIP")
prepare() {
  tar -xvf "v${pkgver}.tar.gz"
  cd "${srcdir}/${pkgname}-${pkgver}"

  sed -i 's/--ia32//g' package.json

  npm install --cache "$srcdir/npm-cache"
}
package() {
  cd "${srcdir}/${pkgname}-${pkgver}"
  npm run pack --cache "$srcdir/npm-cache"
  install -d "$pkgdir/usr/lib"
  install -Dm644 dist/linux-unpacked/resources/app.asar "$pkgdir/usr/lib/$pkgname/app.asar"
  install -Dm644 LICENSE -t "$pkgdir/usr/share/licenses/$pkgname"
  for size in 22 24 32 48 64 128 256 512; do
      install -Dm644 "assets/icons/sleek.png" "${pkgdir}/usr/share/icons/hicolor/${size}x${size}/apps/${pkgname}.png"
  done
  cd "$srcdir"
  install -Dm755 "../$pkgname".sh "$pkgdir/usr/bin/$pkgname"

  install -Dm644 "${pkgname}-${pkgver}/dist/linux-unpacked/${pkgname/-/.}" -t "$pkgdir/usr/share/applications/"
  printf "[Desktop Entry]\nName=${pkgname}\nComment=${pkgdesc}\nExec=/usr/bin/${pkgname}\nTerminal=false\nType=Application\nIcon=sleek\nCategories=ProjectManagement;" > ${pkgname}.desktop

  install -Dm644 "${pkgname}.desktop" -t "$pkgdir/usr/share/applications/"
}
