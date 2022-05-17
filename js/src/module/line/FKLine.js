import * as THREE from "three"
import {CatmullRomCurve3} from "three"

class FKLine extends CatmullRomCurve3 {
    constructor(points = [], color = Math.random() * 0xffffff, arc = 200) {
        super(points, false, "catmullrom", 0)
        this.ARC_SEGMENTS = arc

        this.material = new THREE.LineBasicMaterial({
            color: color,
            opacity: 0.35
        })
        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.ARC_SEGMENTS * 3), 3))

        this.curve = new THREE.Line(this.geometry, this.material)
        this.curve.castShadow = true

        const paramPointMaterial = new THREE.MeshLambertMaterial({color: 0xffffff})
        const paramPointGeometry = new THREE.OctahedronGeometry(15)
        this.paramObj = new THREE.Mesh(paramPointGeometry, paramPointMaterial)

        this.linePoints = points
    }

    update() {
        const tempPoint = new THREE.Vector3()
        const mesh = this.curve
        const curvePointPositions = mesh.geometry.attributes.position

        for (let i = 0; i < this.ARC_SEGMENTS; i++) {
            const t = i / (this.ARC_SEGMENTS - 1)
            this.getPoint(t, tempPoint)
            curvePointPositions.setXYZ(i, tempPoint.x, tempPoint.y, tempPoint.z)
        }

        curvePointPositions.needsUpdate = true
    }

    getPointByParam(t = 0) {
        this.paramObj.position.copy(this.getPoint(t))
        this.paramObj.material.color.set(this.material.color)
        this.paramObj.visible = this.curve.visible
    }
}


export {FKLine}