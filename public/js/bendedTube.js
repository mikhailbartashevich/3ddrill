function createDrillModel() {

    var cylinderHeight = 600, basicTubeDiameter = 120, basicMultiplier = 0.7;

    objects.push(createCylinder({x : 0, y : 1000},  basicTubeDiameter,                      cylinderHeight/3));
    objects.push(createCylinder({x : 0, y : 600},   basicTubeDiameter * basicMultiplier,    cylinderHeight));
    objects.push(createCylinder({x : 0, y : 0},     basicTubeDiameter * basicMultiplier,    cylinderHeight)); //cylinder in the center of coordinate grid
          
    var start    =  new THREE.Vector3(0,    -cylinderHeight/2, 0);
    var middle   =  new THREE.Vector3(0,    -700, 0);
    var endPoint =  new THREE.Vector3(500,  -900, 0);

    objects.push(createBendedTube(start, middle, endPoint, basicTubeDiameter * basicMultiplier));

    var endPoint = addNewBendedSector(endPoint, {x : 600,   y : -940,   z : 0},     {x : 700,   y : -1000,  z : -50},   basicMultiplier);
        endPoint = addNewBendedSector(endPoint, {x : 800,   y : -1060,  z : -100},  {x : 950,   y : -1200,  z :  0},    basicMultiplier - 0.2);
        endPoint = addNewBendedSector(endPoint, {x : 1100,  y : -1340,  z : 100},   {x : 1200,  y : -1450,  z :  400},  basicMultiplier - 0.4);      
}

function addNewBendedSector(startVector, midleVector, endVector, multiplier) {
    var basicTubeDiameter = 120;

    var start = startVector;
    var middle = new THREE.Vector3(midleVector.x, midleVector.y, midleVector.z);
    var end = new THREE.Vector3(endVector.x, endVector.y, endVector.z);

    objects.push(createBendedTube(start, middle, end, basicTubeDiameter * multiplier));

    return end;
}

function createBendedTube(start, middle, end, diameterIn) {
    var numPoints = 100;
    var diameter = diameterIn || 80;
    var curveQuad = new THREE.QuadraticBezierCurve3(start, middle, end);

    var tube = new THREE.TubeGeometry(curveQuad, numPoints, diameter, 200, false);
    var mesh = new THREE.Mesh(tube, new THREE.MeshNormalMaterial());
    this.scene.add(mesh);

    return mesh;

}