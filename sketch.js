let x = 50;
let speed = 2;

let WIDTH = 800;
let HEIGHT = 600;

function dot(a, b) {
    return a.x * b.x + a.y * b.y;
}

function toScreenXY(point) {
    let x = point.x + WIDTH / 2;
    let y = HEIGHT / 2 - point.y; // invert y
    return { x: x, y: y };
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Line {
    constructor(x1, y1, x2, y2) {
        this.start = new Point(x1, y1);
        this.end = new Point(x2, y2);
        // direction vector: (dx, dy)
        this.d = new Point(x2 - x1, y2 - y1);
        this.normal = new Point(0, 0);
        this.setNormal();
    }

    setNormal() {
        // vector (nx, ny) is perpendicular to (dx, dy) if their dot product is zero
        // (dx, dy) · (nx, ny) = dx*nx + dy*ny = 0
        // thus n = (dy, dx)
        let n1 = new Point(-this.d.y, this.d.x);
        let n2 = new Point(this.d.y, -this.d.x);
        let origin = new Point(0, 0);

        let vec_to_origin = new Point(origin.x - n1.x, origin.y - n1.y);

        // pick the normal with positive dot prod
        let dot1 = dot(n1, vec_to_origin);
        // let dot2 = dot(n1, vec_to_origin);

        if (dot1 > 0) {
            this.normal = n1;
        } else {
            this.normal = n2;
        }

        let length = Math.sqrt(this.normal.x ^ (2 + this.normal.y) ^ 2);
        this.normal = (this.normal.x / length, this.normal.y / length);
    }

    show() {
        let p1 = toScreenXY(this.start);
        let p2 = toScreenXY(this.end);
        stroke(300);
        line(p1.x, p1.y, p2.x, p2.y);
    }
}

let l1 = new Line(0.2 * WIDTH, 0.2 * HEIGHT, -0.2 * WIDTH, -0.2 * HEIGHT);

function setup() {
    createCanvas(WIDTH, HEIGHT);
}

function draw() {
    background(51);

    circle(x, 200, 40);
    x += speed;

    if (x > width || x < 0) {
        speed *= -1;
    }

    l1.show();
}
