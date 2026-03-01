import p5 from "p5";
import { Vec2 } from "./utils";

export class Particle {
    pos: Vec2;
    vel: Vec2;
    acc: Vec2;
    density: number;
    pressure: number;
    mass: number;
    force: Vec2;
    radius: number;
    maxVel: number;
    damping: number;
    screenW: number;
    screenH: number;
    locked: boolean;

    constructor(x: number, y: number, radius: number, screenW: number, screenH: number) {
        this.pos = new Vec2(x, y);
        const multiplier = 1;
        this.vel = new Vec2((Math.random() - 0.5) * multiplier, (Math.random() - 0.5) * multiplier);
        // this.vel = new Vec2(0, 0);
        this.acc = new Vec2(0, 0);
        this.force = new Vec2(0, 0);
        this.maxVel = 40;
        this.radius = radius;
        this.mass = 10 * this.radius;
        this.damping = 0.95;
        this.screenW = screenW;
        this.screenH = screenH;
        this.density = 1;
        this.pressure = 1;
        this.locked = false;
    }

    handleBoundaries() {
        if (this.pos.x > this.screenW - this.radius / 2) {
            this.pos.x = this.screenW - this.radius / 2;
            this.vel.x *= -1 * this.damping;
        } else if (this.pos.x < this.radius / 2) {
            this.pos.x = this.radius / 2;
            this.vel.x *= -1 * this.damping;
        }

        if (this.pos.y > this.screenH - this.radius / 2) {
            this.pos.y = this.screenH - this.radius / 2;
            this.vel.y *= -1 * this.damping;
        } else if (this.pos.y < this.radius / 2) {
            this.pos.y = this.radius / 2;
            this.vel.y = Math.random() - 0.5 * this.damping;
        }
    }

    specialBoundaryX(x: number) {
        if (x > this.screenW - 5) {
            return;
        }
        if (this.pos.x < x + this.radius / 2) {
            this.pos.x = x + this.radius / 2;
            this.vel.x *= -1 * this.damping;
        }
    }

    specialBoundaryY(y: number) {
        if (y > this.screenH - 5) {
            return;
        }
        if (this.pos.y < y + this.radius / 2) {
            this.pos.y = y + this.radius / 2;
            this.vel.y *= -1 * this.damping;
        }
    }

    update(dt: number) {
        if (this.locked) {
            return;
        }

        // update vel
        // this.vel.x += this.acc.x * dt;
        // this.vel.y += this.acc.y * dt;
        this.vel.add(this.acc.mult_scaler(dt));

        // this.force.div(this.density)
        // this.force.mult(dt)
        // this.vel.add(this.force)

        // limit vel
        this.vel.x = Math.max(Math.min(this.vel.x, this.maxVel), -this.maxVel);
        this.vel.y = Math.max(Math.min(this.vel.y, this.maxVel), -this.maxVel);

        this.vel.mult_scaler(this.damping);

        // update pos
        this.pos.add(this.vel.clone().mult_scaler(dt));
        // this.pos.x += this.vel.x * dt;
        // this.pos.y += this.vel.y * dt;

        // bounce off wall
        if (this.pos.x > this.screenW - this.radius) {
            this.pos.x = this.screenW - this.radius;
            this.vel.x *= -1 * this.damping;
        } else if (this.pos.x < this.radius) {
            this.pos.x = this.radius;
            this.vel.x *= -1 * this.damping;
        }

        if (this.pos.y > this.screenH - this.radius) {
            this.pos.y = this.screenH - this.radius;
            this.vel.y *= -1 * this.damping;
        } else if (this.pos.y < this.radius) {
            this.pos.y = this.radius;
            this.vel.y *= -1 * this.damping;
        }

        // acc back to 0
        this.acc.mult_scaler(0);
    }

    update2(dt: number) {
        if (this.locked) {
            return;
        }
        // Update velocity
        this.vel.add(this.acc.clone().mult_scaler(dt));

        // Apply damping
        this.vel.mult_scaler(this.damping);

        // Update position
        this.pos.add(this.vel.clone().mult_scaler(dt));

        // Reset accumulated acceleration
        this.acc.x = 0;
        this.acc.y = 0;
    }

    particleCollision(p: Particle) {
        const dx = p.pos.x - this.pos.x;
        const dy = p.pos.y - this.pos.y;
        const distSq = dx * dx + dy * dy;
        const radiusSum = this.radius + p.radius;

        if (distSq <= radiusSum * radiusSum) {
            const distance = Math.sqrt(distSq);

            // static res, change pos directly away from overlap
            const overlap = radiusSum - distance;
            const nx = dx / distance;
            const ny = dy / distance;

            this.pos.x -= (nx * overlap) / 2;
            this.pos.y -= (ny * overlap) / 2;
            p.pos.x += (nx * overlap) / 2;
            p.pos.y += (ny * overlap) / 2;

            // dynamic res
            const tx = -ny;
            const ty = nx;

            const dpTan1 = this.vel.x * tx + this.vel.y * ty;
            const dpTan2 = p.vel.x * tx + p.vel.y * ty;

            const dpNorm1 = this.vel.x * nx + this.vel.y * ny;
            const dpNorm2 = p.vel.x * nx + p.vel.y * ny;

            const m1 = this.mass;
            const m2 = p.mass;

            const newNorm1 = (dpNorm1 * (m1 - m2) + 2 * m2 * dpNorm2) / (m1 + m2);

            const newNorm2 = (dpNorm2 * (m2 - m1) + 2 * m1 * dpNorm1) / (m1 + m2);

            this.vel.x = tx * dpTan1 + nx * newNorm1;
            this.vel.y = ty * dpTan1 + ny * newNorm1;

            p.vel.x = tx * dpTan2 + nx * newNorm2;
            p.vel.y = ty * dpTan2 + ny * newNorm2;

            // swap normal velocities (only when masses are equal)
            // this.vel.x = tx * dpTan1 + nx * dpNorm2;
            // this.vel.y = ty * dpTan1 + ny * dpNorm2;
            // p.vel.x = tx * dpTan2 + nx * dpNorm1;
            // p.vel.y = ty * dpTan2 + ny * dpNorm1;
        }
    }

    particleCollision_Impulse(p: Particle) {
        const dx = p.pos.x - this.pos.x;
        const dy = p.pos.y - this.pos.y;
        const distSq = dx * dx + dy * dy;
        const radiusSum = this.radius + p.radius;

        if (distSq > radiusSum * radiusSum) return;

        const distance = Math.sqrt(distSq);
        if (distance === 0) return;

        // get normal
        const nx = dx / distance;
        const ny = dy / distance;

        // static response, separate overlap
        const overlap = radiusSum - distance;
        this.pos.x -= (nx * overlap) / 2;
        this.pos.y -= (ny * overlap) / 2;
        p.pos.x += (nx * overlap) / 2;
        p.pos.y += (ny * overlap) / 2;

        // rel velocity
        const rvx = p.vel.x - this.vel.x;
        const rvy = p.vel.y - this.vel.y;

        const velAlongNormal = rvx * nx + rvy * ny;

        if (velAlongNormal > 0) return;

        // damping; 1 = no damping, 0 = max
        const e = 0.8;

        const j = (-(1 + e) * velAlongNormal) / (1 / this.mass + 1 / p.mass);

        const impulseX = j * nx;
        const impulseY = j * ny;

        this.vel.x -= impulseX / this.mass;
        this.vel.y -= impulseY / this.mass;

        p.vel.x += impulseX / p.mass;
        p.vel.y += impulseY / p.mass;
    }

    addForce(x: number, y: number) {
        this.acc.x += x;
        this.acc.y += y;
    }

    show(p: p5) {
        p.stroke(255);
        p.strokeWeight(1);
        p.circle(this.pos.x, this.pos.y, this.radius * 2);
    }
}
