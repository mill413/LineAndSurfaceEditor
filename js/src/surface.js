import {FKScene, makeTextSprite} from "./module/FKScene.js";
import GUI from "../lib/three/examples/jsm/libs/lil-gui.module.min.js"
import {FKGrid} from "./module/surface/FKGrid.js";
import * as THREE from "three"
import {FKBezierSurface} from "./module/surface/FKBezierSurface.js";
import {FKBSplineSurface} from "./module/surface/FKBSplineSurface.js";

let fk = new FKScene(render)
const controlPointsPositions = [[], [], [], []]

const surfaces = {
    grid: null,
    bezier: null,
    bSpline: null
}

const gui = new GUI()
let GUIPreset = {}
const GUIParams = {
    grid: true,
    bezier: true,
    bSpline: true,
    arc: 200,
    export: exportPoints,
    reset() {
        gui.load(GUIPreset)
        load(
            [[
                new THREE.Vector3(275, 300, 24),
                new THREE.Vector3(71, 300, 438),
                new THREE.Vector3(-183, 300, 507),
                new THREE.Vector3(-400, 300, 63)
            ], [
                new THREE.Vector3(275, 100, 351),
                new THREE.Vector3(169, 100, 519),
                new THREE.Vector3(-62, 100, 744),
                new THREE.Vector3(-400, 100, 399)
            ], [
                new THREE.Vector3(275, -100, 287),
                new THREE.Vector3(169, -100, 519),
                new THREE.Vector3(-62, -100, 744),
                new THREE.Vector3(-400, -100, 461)
            ], [
                new THREE.Vector3(275, -300, 0),
                new THREE.Vector3(70, -300, 414),
                new THREE.Vector3(-228, -300, 460),
                new THREE.Vector3(-400, -300, 150)
            ]]
        )

        render()
    }
}
const ColorParams = {
    grid: "#ff0000",
    bezierRow: "#4455ee",
    bezierSurface: "#ff00ff",
    bSplineRow: "#00ffff",
    bSplineSurface: "#00ff00"
}

let pointSprites = [[], [], [], []]

main()

function main() {

    fk.createInterface(updateSurface)
    setGUI()
    initialControlPoints()

    surfaces.grid = new FKGrid(controlPointsPositions, ColorParams.grid, ColorParams.grid)
    surfaces.bezier = new FKBezierSurface(controlPointsPositions, ColorParams.bezierRow, ColorParams.bezierSurface)
    surfaces.bSpline = new FKBSplineSurface(controlPointsPositions, ColorParams.bSplineRow, ColorParams.bSplineSurface)

    for (const k in surfaces) {
        const surface = surfaces[k]
        if (surface != null) {
            surface.addTo(fk.scene)
        }
    }

    load(
        [[
            new THREE.Vector3(275, 300, 24),
            new THREE.Vector3(71, 300, 438),
            new THREE.Vector3(-183, 300, 507),
            new THREE.Vector3(-400, 300, 63)
        ], [
            new THREE.Vector3(275, 100, 351),
            new THREE.Vector3(169, 100, 519),
            new THREE.Vector3(-62, 100, 744),
            new THREE.Vector3(-400, 100, 399)
        ], [
            new THREE.Vector3(275, -100, 287),
            new THREE.Vector3(169, -100, 519),
            new THREE.Vector3(-62, -100, 744),
            new THREE.Vector3(-400, -100, 461)
        ], [
            new THREE.Vector3(275, -300, 0),
            new THREE.Vector3(70, -300, 414),
            new THREE.Vector3(-228, -300, 460),
            new THREE.Vector3(-400, -300, 150)
        ]]
    )

    fk.render()
}

function setGUI() {

    gui.title("自由曲面控制")

    gui.add(GUIParams, "export").name("导出特征点")
    gui.add(GUIParams, "reset").name("重置")

    const gridFolder = gui.addFolder("特征网格")
    gridFolder.add(GUIParams, "grid").name("特征网格").onChange(() => {
        surfaces.grid.row.forEach(row => {
            row.curve.visible = GUIParams.grid
        })
        surfaces.grid.column.forEach(col => {
            col.curve.visible = GUIParams.grid
        })
        fk.render()
    })
    gridFolder.addColor(ColorParams, "grid").name("颜色").onChange(() => {
        surfaces.grid.row.forEach(row => {
            row.curve.material.color.set(ColorParams.grid)
        })
        surfaces.grid.column.forEach(col => {
            col.curve.material.color.set(ColorParams.grid)
        })
        fk.render()
    })

    const bezierFolder = gui.addFolder("贝塞尔曲面")
    bezierFolder.add(GUIParams, "bezier").name("贝塞尔曲面").onChange(() => {
        surfaces.bezier.row.forEach(row => {
            row.curve.visible = GUIParams.bezier
        })
        surfaces.bezier.column.forEach(col => {
            col.curve.visible = GUIParams.bezier
        })
        fk.render()
    })
    bezierFolder.addColor(ColorParams, "bezierSurface").name("颜色").onChange(() => {
        surfaces.bezier.column.forEach(col => {
            col.curve.material.color.set(ColorParams.bezierSurface)
        })
        fk.render()
    })
    bezierFolder.addColor(ColorParams, "bezierRow").name("辅助线颜色").onChange(() => {
        surfaces.bezier.row.forEach(row => {
            row.curve.material.color.set(ColorParams.bezierRow)
        })
        fk.render()
    })

    const bSplineFolder = gui.addFolder("b样条曲面")
    bSplineFolder.add(GUIParams, "bSpline").name("均匀B样条曲面").onChange(() => {
        surfaces.bSpline.row.forEach(row => {
            row.curve.visible = GUIParams.bSpline
        })
        surfaces.bSpline.column.forEach(col => {
            col.curve.visible = GUIParams.bSpline
        })
        fk.render()
    })
    bSplineFolder.addColor(ColorParams, "bSplineSurface").name("颜色").onChange(() => {
        surfaces.bSpline.column.forEach(col => {
            col.curve.material.color.set(ColorParams.bSplineSurface)
        })
        fk.render()
    })
    bSplineFolder.addColor(ColorParams, "bSplineRow").name("辅助线颜色").onChange(() => {
        surfaces.bSpline.row.forEach(row => {
            row.curve.material.color.set(ColorParams.bSplineRow)
        })
        fk.render()
    })

    GUIPreset = gui.save()
    gui.open()
}

function initialControlPoints() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            fk.addControlHelper(controlPointsPositions[i][j])
        }
    }

    for (let i = 0; i < 4; i++) {
        controlPointsPositions[i].length = 0

        for (let j = 0; j < 4; j++) {
            controlPointsPositions[i].push(fk.helperObjects[i * 4 + j].position)
        }
    }
}

function load(new_positions) {

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < controlPointsPositions[i].length; j++) {
            controlPointsPositions[i][j].copy(new_positions[i][j])
        }
        updateSurface()
    }
}

function updateSurface() {
    for (const k in surfaces) {
        const surface = surfaces[k]
        if (surface != null) {
            switch (k) {
                case "bezier": {
                    surface.updateBezier(controlPointsPositions)
                    break
                }
                case "bSpline": {
                }
                    surface.updateBSpline(controlPointsPositions)
                    break
            }
            surface.update()
        }
    }
}

function render() {
    pointSprites.forEach(row => {
        row.forEach(ps => {
            fk.remove(ps)
        })
        row.length = 0
    })
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let ps = makeTextSprite("P" + (i + 1).toString() + "," + (j + 1).toString(),
                {
                    fontsize: 50
                })
            fk.add(ps)
            pointSprites[i].push(ps)
        }
    }
    pointSprites.forEach((row, i) => {
        pointSprites[i].forEach((col, j) => {
            pointSprites[i][j].position.set(controlPointsPositions[i][j].x, controlPointsPositions[i][j].y, controlPointsPositions[i][j].z)
        })
    })
}

function exportPoints() {
    const points = [[], [], [], []]
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const p = fk.helperObjects[i * 4 + j].position
            points[i].push(`new THREE.Vector3(${p.x},${p.y},${p.z})`)
        }
    }

    const output = []
    points.forEach(row => {
        output.push(row.join(",\n\t"))
    })

    const code = "[[\n\t" + (output.join("\n\t], [\n\t")) + "\n\t]]"
    prompt('copy and paste code', code)
}
