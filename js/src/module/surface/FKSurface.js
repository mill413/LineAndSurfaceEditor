import * as THREE from "three"

export class FKSurface {
    constructor() {
        this.row = []
        this.column = []

        this.division = 200
    }

    update() {
        const tempPoint = new THREE.Vector3()

        const rows = this.row
        rows.forEach(row => {
            const rowMesh = row.curve
            const rowPointPositions = rowMesh.geometry.attributes.position

            for (let i = 0; i < this.division; i++) {
                const t = i / (this.division - 1)
                row.getPoint(t, tempPoint)
                rowPointPositions.setXYZ(i, tempPoint.x, tempPoint.y, tempPoint.z)
            }

            rowPointPositions.needsUpdate = true
        })

        const columns = this.column
        columns.forEach(col => {
            const colMesh = col.curve
            const colPointPositions = colMesh.geometry.attributes.position

            for (let i = 0; i < this.division; i++) {
                const t = i / (this.division - 1)
                col.getPoint(t, tempPoint)
                colPointPositions.setXYZ(i, tempPoint.x, tempPoint.y, tempPoint.z)
            }

            colPointPositions.needsUpdate = true
        })
    }

    addTo(scene) {
        this.row.forEach(row => {
            scene.add(row.curve)
        })
        this.column.forEach(col => {
            scene.add(col.curve)
        })
    }
}