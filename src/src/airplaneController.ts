import clamp from './clamp';
import { GameState } from './gameState';

export default class AirplaneController {
    public currentSpeed = 0;
    public angularVelocity = 0;
    public angle = 0;
    // Fixed physics constants
    private accelerationFriction = 0.9998;
    private angularVelocityFriction = 0.998;
    private angularSpeed = 0.30;



    public updateInputs(isAccelerating: boolean, cursorX: number, cursorY: number) {
        // Turning
        if (cursorX > 0) {
            this.angularVelocity = this.angularSpeed;
        } else if (cursorX < 0) {
            this.angularVelocity = -this.angularSpeed;
        }
        if (cursorY !== 0) {
            this.angularVelocity = 0;
        }

        // Acceleration
        const maxMoveSpeed = GameState.stats.maxSpeed;
        const acceleration = GameState.stats.acceleration;

        // If out of fuel, cannot accelerate
        const canAccelerate = isAccelerating && GameState.fuel > 0;

        if (canAccelerate) {
            this.currentSpeed = clamp(this.currentSpeed + acceleration, 0, maxMoveSpeed);
        } else if (this.currentSpeed > 0) {
            this.currentSpeed = clamp(this.currentSpeed * this.accelerationFriction - (cursorY > 0 ? acceleration : 0), 0, maxMoveSpeed);
        } else {
            this.currentSpeed = 0;
        }
    }

    public updatePosition(center: number[]) {
        this.angularVelocity *= this.angularVelocityFriction;
        this.angle += this.angularVelocity;

        const angleRad = this.angle * Math.PI / 180;

        const deltaY = Math.cos(angleRad) * this.currentSpeed;
        const deltaX = Math.sin(angleRad) * this.currentSpeed;

        center[1] += deltaY;
        center[0] -= deltaX;

        return center;
    }


}
