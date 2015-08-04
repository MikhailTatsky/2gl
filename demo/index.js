import Color from './Color';
import Stats from 'stats-js';
import utils from './utils';

let stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0';
stats.domElement.style.bottom = '0';
document.body.appendChild(stats.domElement);

let floorData = mallData.floorGeometries[2];

/*let floorData = window.floorData = {
    rooms: [],
    islands: [],
    wallIndices: [],
    wallTopAreaIndices: [],
    vertices: [
        -100, 0, 0,
        0, 100, 0,
        100, 0, 0
    ],
    areaIndices: [0, 2, 1]
};*/

let addColorField = room => {
    room.color = Color.getByType(room.type);
    room.color[3] = 1;
};

addColorField(floorData);
floorData.rooms.forEach(addColorField);
floorData.islands.forEach(addColorField);

let camera = new dgl.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 100000);
camera.position[2] = 200;
camera.updateProjectionMatrix();


let renderer = new dgl.Renderer({
    container: 'container'
});

let retinaFactor = window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI) || 1;
renderer.setPixelRatio(retinaFactor);
renderer.setSize(window.innerWidth, window.innerHeight);

let scene = new dgl.Scene();

let ambientLight = new dgl.AmbientLight([0.5, 0.5, 0.5]);

scene.addLight(ambientLight);

let directionalLight = new dgl.DirectionalLight([0.5, 0.5, 0.5]);
directionalLight.position[0] = 1;
scene.addLight(directionalLight);

let directionalLight2 = new dgl.DirectionalLight([0.5, 0.5, 0.5]);
directionalLight2.position[0] = -1;
scene.addLight(directionalLight2);

initRooms();

function renderLoop() {
    requestAnimationFrame(renderLoop);

    stats.begin();

    renderer.render(scene, camera);

    stats.end();
}
renderLoop();

var zoomDelta = 10;
var zoomMax = 20000;
var zoomMin = -20000;

window.addEventListener('mousewheel', function(ev) {
    var z = camera.position[2];

    if (ev.wheelDelta > 0) {
        camera.position[2] = Math.max(zoomMin, z - zoomDelta);
    } else {
        camera.position[2] = Math.min(zoomMax, z + zoomDelta);
    }
});

function createWallTexture() {
    var canvas = document.createElement('canvas');

    canvas.width = 2;
    canvas.height = 512;

    var context = canvas.getContext('2d');

    var gradient = context.createLinearGradient(0, 0, 0, 512);

    gradient.addColorStop(0.65, '#ffffff');
    gradient.addColorStop(1, '#888888');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 512);

    return canvas;
}

function getUVArray(numVertices) {
    var result = new Array(numVertices * 2);

    var base = [
        0, 0,
        1, 0,
        0, 1,

        1, 0,
        1, 1,
        0, 1
    ];

    for (var i = 0; i < numVertices; i++) {
        result[i * 2] = base[i % (base.length / 2) * 2];
        result[i * 2 + 1] = base[i % (base.length / 2) * 2 + 1];
    }

    return result;
}

function initRooms() {
    let dataVertices = floorData.vertices;
    let dataRooms = floorData.rooms;
    let dataIslands = floorData.islands;
    let dataFloor = floorData;
    let allVertices = [];
    let allColorVertices = [];
    let allTextureVertices = [];
    let allTextureAlphaVertices = [];
    let allLightAlphaVertices = [];

    let addAreas = room => {
        let vertices = utils.mapIndicesToVertices(dataVertices, room.areaIndices);
        allVertices = allVertices.concat(vertices);

        let colorVertices = [];

        for (let i = 0; i < vertices.length / 3; i++) {
            colorVertices = colorVertices.concat(room.color);
            allTextureVertices.push(0, 0);
            allTextureAlphaVertices.push(0);
            allLightAlphaVertices.push(0);
        }

        allColorVertices = allColorVertices.concat(colorVertices);
    };

    let addWalls = room => {
        let vertices = utils.mapIndicesToVertices(dataVertices, room.wallIndices);
        allVertices = allVertices.concat(vertices);

        let colorVertices = [];
        let color = room.color.map(c => c * 0.95);
        color[3] = 1;

        for (let i = 0; i < vertices.length / 3; i++) {
            colorVertices = colorVertices.concat(color);
            allTextureAlphaVertices.push(1);
            allLightAlphaVertices.push(1);
        }

        allTextureVertices = allTextureVertices.concat(getUVArray(room.wallIndices.length));

        allColorVertices = allColorVertices.concat(colorVertices);
    };

    let addWallTopAreas = room => {
        let vertices = utils.mapIndicesToVertices(dataVertices, room.wallTopAreaIndices);
        allVertices = allVertices.concat(vertices);

        let colorVertices = [];

        for (let i = 0; i < vertices.length / 3; i++) {
            colorVertices = colorVertices.concat([1, 1, 1, 1]);
            allTextureVertices.push(0, 0);
            allTextureAlphaVertices.push(0);
            allLightAlphaVertices.push(0);
        }

        allColorVertices = allColorVertices.concat(colorVertices);
    };

    // полы
    addAreas(dataFloor);
    dataRooms.forEach(addAreas);
    dataIslands.forEach(addAreas);

    // стены
    addWalls(dataFloor);
    dataRooms.forEach(addWalls);
    dataIslands.forEach(addWalls);

    // верхушки стен
    addWallTopAreas(dataFloor);
    dataRooms.forEach(addWallTopAreas);

    let vertexBuffer = new dgl.Buffer(new Float32Array(allVertices), 3);
    let colorBuffer = new dgl.Buffer(new Float32Array(allColorVertices), 4);
    let textureBuffer = new dgl.Buffer(new Float32Array(allTextureVertices), 2);
    let textureAlphaBuffer = new dgl.Buffer(new Float32Array(allTextureAlphaVertices), 1);
    let lightAlphaBuffer = new dgl.Buffer(new Float32Array(allLightAlphaVertices), 1);

    let geometry = new dgl.Geometry();
    geometry
        .setBuffer('position', vertexBuffer)
        .setBuffer('color', colorBuffer)
        .setBuffer('texture', textureBuffer)
        .setBuffer('textureAlpha', textureAlphaBuffer)
        .setBuffer('directionLightAlpha', lightAlphaBuffer);

    geometry.computeNormals();

    let program = new dgl.Program();

    let mesh = new dgl.Mesh(geometry, program);

    //let img = document.createElement('img');
    //img.onload = function() {
        mesh.setTexture(new dgl.Texture(createWallTexture()));
        scene.add(mesh);
    //};
    //img.src = './ship3.png';

    window.addEventListener('click', function(ev) {
        let coords = utils.normalizeMousePosition([ev.clientX, ev.clientY]);

        let raycaster = new dgl.Raycaster();
        raycaster.setFromCamera(coords, camera);

        console.log(raycaster.intersectObjects(scene.childs, true));
    });
}
