# Maintainer: ransome1 <ransome@uber.space>
pkgname="sleek"
pkgver=1.0.0
pkgrel=1
epoch=1
pkgdesc="Todo app based on the todo.txt format for Linux, free and open-source"
arch=("x86_64")
url="https://github.com/ransome1/sleek/"
license=("MIT")
provides=("sleek")
options=(!strip)
makedepends=("npm")
depends=("electron")
source=("${url}archive/refs/heads/master.zip")
sha512sums=("SKIP")

build() {
  ls
  unzip -o master.zip
  cd "sleek-master"
  npm install
}

package() {
  npm run pack

  install -Dm644 "$srcdir/sleek-master/dist/linux-unpacked/resources/app.asar" "$pkgdir/usr/lib/$pkgname.asar"

  install -d -Dm644 "${pkgdir}/usr/share"
  cp -r "${srcdir}/sleek-master/dist/linux-unpacked/${pkgname}" "${pkgdir}/usr/share"

  printf "[Desktop Entry]\nName=${pkgname}\nComment=${pkgdesc}\nExec=/usr/bin/${pkgname}\nTerminal=false\nType=Application\nIcon=sleek\nCategories=ProjectManagement;" > ${pkgname}.desktop
  install -Dm644 "${pkgname}.desktop" -t "$pkgdir/usr/share/applications/"

  cat << '__EOF__' | install -Dm755 /dev/stdin "${pkgdir}"/usr/bin/sleek
  #!/bin/sh

  exec electron /usr/lib/sleek.asar "$@"
__EOF__
}
