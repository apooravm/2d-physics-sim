export class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(v: Vec2): this {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v: Vec2): this {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    dot(v: Vec2): number {
        return this.x * v.x + this.y * v.y;
    }

    mult_scaler(s: number): this {
        this.x *= s;
        this.y *= s;
        return this;
    }

    div_scaler(s: number): this {
        this.x /= s;
        this.y /= s;
        return this;
    }

    clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let m = this.mag();
        if (m > 0) this.mult_scaler(1 / m);
    }

    distance(other: Vec2): number {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
