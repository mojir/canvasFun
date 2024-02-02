class Vector2 {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  sub(other) {
    if (other instanceof PolarVector2) {
      return this.sub(other.toVector2())
    } else if (other instanceof Vector2) {
      return new Vector2(this.x - other.x, this.y - other.y)
    }
    throw Error('Invalid type', other)
  }
  add(other) {
    if (other instanceof PolarVector2) {
      return this.add(other.toVector2())
    } else if (other instanceof Vector2) {
      return new Vector2(this.x + other.x, this.y + other.y)
    }
    throw Error('Invalid type', other)
  }
  dot(other) {
    if (other instanceof PolarVector2) {
      return this.dot(other.toVector2())
    } else if (other instanceof Vector2) {
      return this.x * other.x + this.y * other.y
    }
    throw Error('Invalid type', other)
  }
  scale(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar)
  }
  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }
  lengthSquared() {
    return this.x ** 2 + this.y ** 2
  }
  orthogonal() {
    return new Vector2(-this.y, this.x)
  }
  getUnitVector() {
    return this.scale(1 / this.length())
  }
  negateX() {
    return new Vector2(-this.x, this.y)
  }
  negateY() {
    return new Vector2(this.x, -this.y)
  }
  rotate(phi) {
    const cos = Math.cos(phi)
    const sin = Math.sin(phi)
    return new Vector2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    )
  }
  toPolarVector2() {
    const r = this.length()
    const phi = Math.atan2(this.y, this.x)
    return new PolarVector2(r, phi)
  }
  toVector2() {
    return this
  }
}

class PolarVector2 {
  constructor(r, phi) {
    while (phi < 0) {
      phi += Math.PI * 2
    }
    while (phi > Math.PI * 2) {
      phi -= Math.PI * 2
    }
    this.r = r
    this.phi = phi
  }

  sub(other) {
    if (other instanceof PolarVector2) {
      return this.toVector2().sub(other.toVector2()).toPolar()
    } else if (other instanceof Vector2) {
      return this.toVector2().sub(other).toPolar()
    }
    throw Error('Invalid type', other)
  }
  add(other) {
    if (other instanceof PolarVector2) {
      return this.toVector2().add(other.toVector2()).toPolar()
    } else if (other instanceof Vector2) {
      return this.toVector2().add(other).toPolar()
    }
    throw Error('Invalid type', other)
  }
  dot(other) {
    if (other instanceof PolarVector2) {
      return this.toVector2().dot(other.toVector2()).toPolar()
    } else if (other instanceof Vector2) {
      return this.toVector2().dot(other).toPolar()
    }
    throw Error('Invalid type', other)
  }
  scale(scalar) {
    return new PolarVector2(this.r * scalar, this.phi)
  }
  length() {
    return this.r
  }
  lengthSquared() {
    return this.r ** 2
  }
  orthogonal() {
    return new PolarVector2(this.r, this.phi + Math.PI / 2)
  }
  getUnitVector() {
    return this.scale(1, this.phi)
  }
  negateX() {
    return this.toVector2().negateX().toPolar()
  }
  negateY() {
    return this.toVector2().negateY().toPolar()
  }
  rotate(phi) {
    return new PolarVector2(this.r, this.phi + phi)
  }
  toVector2() {
    const x = this.r * Math.cos(this.phi)
    const y = this.r * Math.sin(this.phi)
    return new Vector2(x, y)
  }
  toPolarVector2() {
    return this
  }
}

class Polygon {
  constructor(points) {
    this.points = points
  }

  getBoundingPoints() {
    const minPoint = this.points.reduce((min, point) => new Vector2(Math.min(min.x, point.x), Math.min(min.y, point.y)), new Vector2(Infinity, Infinity))
    const maxPoint = this.points.reduce((max, point) => new Vector2(Math.max(max.x, point.x), Math.max(max.y, point.y)), new Vector2(-Infinity, -Infinity))
    return { minPoint, maxPoint }
  }


  getDimensions() {
    const maxRadSquared = this.points.reduce((max, point) => Math.max(point.lengthSquared(), max), 0)
    const size = Math.sqrt(maxRadSquared) * 2
    return new Vector2(size, size)
  }

  scale(scalar) {
    return new Polygon(this.points.map(point => point.scale(scalar)))
  }

  translate(vector) {
    return new Polygon(this.points.map(point => point.add(vector)))
  }

  rotate(phi) {
    return new Polygon(this.points.map(point => point.rotate(phi)))
  }
}
