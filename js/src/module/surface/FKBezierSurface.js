import {FKSurface} from "./FKSurface.js";
import {FKBezierLine} from "../line/FKBezierLine.js";

export class FKBezierSurface extends FKSurface {
    constructor(controlPoints, lineColor, surfaceColor) {
        super()

        for (let i = 0; i < 4; i++) {
            this.row[i] = new FKBezierLine(controlPoints[i], lineColor)
        }
        for (let i = 0; i < this.division; i++) {
            this.column[i] = new FKBezierLine([
                    this.row[0].linePoints[i],
                    this.row[1].linePoints[i],
                    this.row[2].linePoints[i],
                    this.row[3].linePoints[i]
                ], surfaceColor
            )
        }
    }

    updateBezier(controlPoints) {
        this.row.forEach((row,i) => {
            row.updateBezier(controlPoints[i])
        })
        this.column.forEach((col, i) => {
            col.updateBezier([
                this.row[0].linePoints[i],
                this.row[1].linePoints[i],
                this.row[2].linePoints[i],
                this.row[3].linePoints[i]
            ])
        })
    }
}