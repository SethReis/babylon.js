var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    //lights
    var light = new BABYLON.DirectionalLight("DirLight", new BABYLON.Vector3(-0.1, -1, 0.2), scene);
    light.specular = new BABYLON.Color3(0.2, 0.2, 0.2);
    light.position = new BABYLON.Vector3(100, 300, 200);
    light.shadowEnabled = true;

    var light2 = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    light2.specular = new BABYLON.Color3(0, 0, 0);
    light2.intensity = 0.5;

    var light3 = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, -1, 0), scene);
    light3.diffuse = new BABYLON.Color3(0.3, 0.3, 0.3);
    light3.specular = new BABYLON.Color3(0, 0, 0);
    light3.intensity = 0.8;

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 500, new BABYLON.Vector3.Zero(), scene);
    camera.setTarget(new BABYLON.Vector3(0, 15, 0));
    camera.attachControl(canvas, true);

    function Mover(x, y, z, radius, scene) {
        this.pos = new Vector(x, y, z);
        this.vel = new Vector(0, 0, 0);
        this.acc = new Vector(0, 0, 0);
        this.mass = radius * radius * radius;
        this.radius = radius;
        this.mesh = new BABYLON.MeshBuilder.CreateSphere("sphere" + Math.random(), {diameter: radius * 2}, scene, false);
        this.mesh.positon = this.pos;
        this.material = new BABYLON.StandardMaterial("texture1", scene);
        this.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        this.mesh.material = this.material;
    }

    Mover.prototype.applyForce = function (force) {
        this.acc.add(force.div(this.mass));
    };

    Mover.prototype.drag = function (mag) {
       var speed = this.vel.mag();

       var dragMagnitude = mag * speed * speed * this.mass / 100;
       var drag = this.vel.clone();

       drag.mult(-1);
       drag.normalize();

       drag.mult(dragMagnitude);

       this.applyForce(drag);
   };

    Mover.prototype.attract = function (mover) {
        let force = Vector.sub(this.pos, mover.pos);
        let distance = force.mag();
        distance = constrain(distance, 5, 25);

        force.normalize();
        let strength = (0.00097 * this.mass * mover.mass) / (distance * distance);
        force.mult(strength);

        mover.applyForce(force);
    };

    Mover.prototype.update = function () {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.mesh.position = this.pos.toBabylon();
        this.acc.mult(0);
    };

    //create Movers
    var movers = [];
    for (var i = 0; i < 20; i++) {
        movers.push(new Mover((Math.random() - 0.5) * 500, 0, (Math.random() - 0.5) * 500, Math.random() * 15 + 3, scene));
        //movers[i].applyForce(new Vector(Math.random() * 1000 - 500, Math.random() * 1000 - 5000, Math.random() * 1000 - 500));
    }

    //animate
    var centerOfMass = new Vector();
    scene.registerBeforeRender(function () {
        centerOfMass = new Vector();
        for (var i = 0; i < movers.length; i++) {
            for (var c = 0; c < movers.length; c++) {
                if (i !== c) {
                    movers[i].attract(movers[c]);
                }
            }
            movers[i].drag(0.05);
            //movers[i].applyForce(new Vector(0, -0.098 * movers[i].mass, 0));
            movers[i].update();
            centerOfMass.add(movers[i].pos);
        }
        centerOfMass.div(movers.length*2);
        for (var i = 0; i < movers.length; i++) {
            movers[i].pos.sub(centerOfMass);
        }
    });

    return scene;
};

var canvas = document.getElementById("renderCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
var scene = createScene();

engine.runRenderLoop(function () {
    if (scene) {
        scene.render();
    }
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});
