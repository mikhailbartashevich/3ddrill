function createCube() {
    var geometry = new THREE.BoxGeometry(500, 100, 500 );

    var material  = new THREE.MeshNormalMaterial({color : nodeColor});

    // material.map = THREE.ImageUtils.loadTexture('./img/earthmap1k.jpg', null, function() {
    //     render();
    // });
    
    var cube = new THREE.Mesh(geometry, material);
    
    this.scene.add(cube);

    return cube;
}

function createCone() {
    var cone = new THREE.Mesh(new THREE.CylinderGeometry(0, 100, 200, 20, 50, false), new THREE.MeshNormalMaterial({color : nodeColor}));
    cone.position.y = 350;
    this.scene.add(cone);

    return cone;
}

function createCylinder(position, radius, length, material) {

    var meshMaterial = material ? material : new THREE.MeshNormalMaterial();

    var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 100, 50, false), meshMaterial);
    
    cylinder.position.x = position.x;
    cylinder.position.y = position.y;
    cylinder.position.z = position.z;

    this.scene.add(cylinder);

    return cylinder;
}
