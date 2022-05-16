import * as THREE from "three"
import {FKLine} from "./FKLine.js";

class FKPolyline extends FKLine {
    constructor(controlPoints) {
        super(calculatePolylineByParam(controlPoints, 0))
    }

    updatePolyline(controlPoints, t = 0) {
        this.points.length = 0
        calculatePolylineByParam(controlPoints, t).forEach(pts => {
            this.points.push(pts)
        })
    }

    exportPoints() {
        return this.points
    }
}

function calculatePointByParam(a, b, t) {
    let x = (1 - t) * a.x + t * b.x
    let y = (1 - t) * a.y + t * b.y
    let z = (1 - t) * a.z + t * b.z
    return new THREE.Vector3(x, y, z)
}

function calculatePolylineByParam(controlPoints, t) {
    let new_polyline = []
    for (let i = 0; i < controlPoints.length - 1; i++) {
        new_polyline.push(calculatePointByParam(controlPoints[i], controlPoints[i + 1], t))
    }
    return new_polyline
}

export {FKPolyline}