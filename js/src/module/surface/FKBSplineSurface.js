import {FKSurface} from "./FKSurface.js";
import {FKBSpline} from "../line/FKBSpline.js";

export class FKBSplineSurface extends FKSurface{
    constructor(controlPoints,lineColor,surfaceColor) {
        super()

        for (let i = 0; i < 4; i++) {
            this.row[i] = new FKBSpline(controlPoints,lineColor,3,"uniform")
        }
        for (let i = 0; i < this.division; i++) {
            this.column[i] = new FKBSpline([
                    this.row[0].linePoints[i],
                    this.row[1].linePoints[i],
                    this.row[2].linePoints[i],
                    this.row[3].linePoints[i]
                ], surfaceColor,3,"uniform"
            )
        }
    }

    updateBSpline(controlPoints){
        this.row.forEach((row,i) => {
            row.updateBSpline(controlPoints[i])
        })
        this.column.forEach((col, i) => {
            col.updateBSpline([
                this.row[0].linePoints[i],
                this.row[1].linePoints[i],
                this.row[2].linePoints[i],
                this.row[3].linePoints[i]
            ])
        })
    }
}