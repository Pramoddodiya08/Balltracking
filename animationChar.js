import "babylonjs-loaders";
import { SceneLoader } from "babylonjs";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas);

let bird;
const buildHouse = (width) => {
  const box = buildBox(width);
  const roof = buildRoof(width);

  const house = BABYLON.Mesh.MergeMeshes(
    [box, roof],
    true,
    false,
    null,
    false,
    true
  );

  house.checkCollisions = true;
  return house;
};
const buildBox = (width) => {
  const boxMat = new BABYLON.StandardMaterial("boxMat");
  boxMat.diffuseTexture = new BABYLON.Texture(
    "https://assets.babylonjs.com/environments/semihouse.png"
  );

  const faceUV = [];
  faceUV[0] = new BABYLON.Vector4(0.6, 0.0, 1.0, 1.0);
  faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.4, 1.0);
  faceUV[2] = new BABYLON.Vector4(0.4, 0, 0.6, 1.0);
  faceUV[3] = new BABYLON.Vector4(0.4, 0, 0.6, 1.0);

  const box = BABYLON.MeshBuilder.CreateBox("box", {
    width: 5,
    faceUV: faceUV,
    wrap: true,
    size: 5,
  });
  box.material = boxMat;
  box.position.y = 3.2;

  return box;
};
const buildRoof = (width) => {
  const roofMat = new BABYLON.StandardMaterial("roofMat");
  roofMat.diffuseTexture = new BABYLON.Texture(
    "https://assets.babylonjs.com/environments/roof.jpg"
  );

  const roof = BABYLON.MeshBuilder.CreateCylinder("roof", {
    diameter: 6,
    height: 2.8,
    tessellation: 3,
  });
  roof.material = roofMat;
  roof.scaling.x = 0.75;
  roof.scaling.y = width;
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 1.5 + 5.3;

  return roof;
};

const createScene = async function () {
  const scene = new BABYLON.Scene(engine);

  // const camera = new BABYLON.ArcRotateCamera(
  //   "camera",
  //   -Math.PI / 2,
  //   Math.PI / 2.5,
  //   15,
  //   new BABYLON.Vector3(0, 0, 0)
  // );
  const camera = new BABYLON.FollowCamera(
    "followCam",
    new BABYLON.Vector3(0, 10, -10),
    scene
  );
  camera.radius = 10;
  camera.heightOffset = 4;
  camera.rotationOffset = 180;
  camera.cameraAcceleration = 0.1;
  camera.maxCameraSpeed = 5;
  scene.activeCamera = camera;
  camera.position = new BABYLON.Vector3(0, 10, -20);
  camera.rotation = new BABYLON.Vector3(0, Math.PI, 0);
  camera.attachControl(scene, true);

  // scene.createDefaultLight();

  scene.shadowsEnabled = true;
  var light = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 0.6;
  light.specular = BABYLON.Color3.Black();

  var light2 = new BABYLON.DirectionalLight(
    "dir01",
    new BABYLON.Vector3(0, -0.5, -1.0),
    scene
  );
  light2.position = new BABYLON.Vector3(0, 5, 5);

  const groundFromHm = new BABYLON.MeshBuilder.CreateGroundFromHeightMap(
    "groundFromHm",
    "images/earth.jpg",
    {
      width: 200,
      height: 200,
      subdivisions: 30,
    },
    scene
  );
  const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseTexture = new BABYLON.Texture(
    "https://raw.githubusercontent.com/anacidre/angular-babylonjs/master/src/assets/textures/distortion.png",
    scene
  );
  groundFromHm.material = groundMaterial;
  groundFromHm.receiveShadows = true;

  const plane = BABYLON.MeshBuilder.CreatePlane("plane", {
    height: 20,
    width: 20,
    size: 20,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });
  plane.position.x = 0;
  plane.position.z = 20;
  plane.scaling = new BABYLON.Vector3(1, 1, 0.05);
  const planeMaterial = new BABYLON.StandardMaterial("planeMaterial", scene);
  planeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
  plane.material = planeMaterial;
  plane.checkCollisions = true;

  const semi_house = buildHouse(2);
  semi_house.rotation.y = -70;
  semi_house.position.x = 70;
  semi_house.position.z = 0;
  const places = [];
  places.push([2, -70, 70, 0]);
  places.push([2, -70, 50, -20]);
  places.push([2, -10, 30, -40]);
  places.push([2, 10, -30, -40]);
  places.push([2, 70, -50, -20]);
  places.push([2, 70, -70, 0]);

  const houses = [];

  for (let i = 0; i < places.length; i++) {
    houses[i] = semi_house.createInstance("house" + i);
    houses[i].rotation.y = places[i][1];
    houses[i].position.x = places[i][2];
    houses[i].position.z = places[i][3];
  }

  const snow =
    "https://raw.githubusercontent.com/anacidre/angular-babylonjs/master/src/assets/textures/flare.png";
  const snowParticleSystem = new BABYLON.ParticleSystem(
    "particles",
    5000,
    scene
  );
  snowParticleSystem.particleTexture = new BABYLON.Texture(snow, scene);
  snowParticleSystem.emitter = new BABYLON.Vector3(0, 2.2, 0);
  snowParticleSystem.minEmitBox = new BABYLON.Vector3(-50, -10, -50);
  snowParticleSystem.maxEmitBox = new BABYLON.Vector3(50, 20, 50);
  snowParticleSystem.minSize = 0.1;
  snowParticleSystem.maxSize = 0.5;
  snowParticleSystem.color1 = new BABYLON.Color4(0.38, 0.55, 1, 0.26);
  snowParticleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
  snowParticleSystem.emitRate = 1000;
  snowParticleSystem.gravity = new BABYLON.Vector3(0, -10, 0);
  snowParticleSystem.start();

  var shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;

  await SceneLoader.ImportMesh(
    "",
    "images/",
    "Parrot.glb",
    scene,
    function (newMeshes, particleSystems, skeletons, animationGroups) {
      bird = newMeshes[0];
      bird.scaling.scaleInPlace(0.05);
      bird.position.y = 5;
      bird.checkCollisions = true;
      bird.ellipsoid = new BABYLON.Vector3(1, 1, 1);
      shadowGenerator.addShadowCaster(bird);
    }
  );

  await SceneLoader.ImportMesh(
    "",
    "https://assets.babylonjs.com/meshes/",
    "HVGirl.glb",
    scene,
    function (newMeshes, particleSystems, skeletons, animationGroups) {
      if (newMeshes.length > 0) {
        const hero = newMeshes[0];

        const groundHeight = groundFromHm.getHeightAtCoordinates(0, 0);

        hero.position.y = groundHeight;
        plane.position.y = groundHeight;
        hero.scaling.scaleInPlace(0.2);
        shadowGenerator.addShadowCaster(hero);
        camera.lockedTarget = hero;

        var heroSpeed = 0.1;
        var heroSpeedBackwards = 0.01;
        var heroRotationSpeed = 0.05;

        var animating = true;

        const walkAnim = scene.getAnimationGroupByName("Walking");
        const walkBackAnim = scene.getAnimationGroupByName("WalkingBack");
        const idleAnim = scene.getAnimationGroupByName("Idle");
        const sambaAnim = scene.getAnimationGroupByName("Samba");

        hero.checkCollisions = true;
        bird.checkCollisions = true;
        hero.ellipsoid = new BABYLON.Vector3(1, 2, 1);

        scene.onBeforeRenderObservable.add(() => {
          camera.setTarget(hero.position);

          var newData = hero.position.clone();
          bird.position.x = newData._x + 2;
          bird.position.z = newData._z - 2;

          var keydown = false;
          if (inputMap["w"]) {
            hero.moveWithCollisions(hero.forward.scaleInPlace(heroSpeed));
            bird.moveWithCollisions(hero.forward.scaleInPlace(heroSpeed));
            keydown = true;
          }
          if (inputMap["s"]) {
            hero.moveWithCollisions(
              hero.forward.scaleInPlace(-heroSpeedBackwards)
            );
            keydown = true;
          }
          if (inputMap["a"]) {
            hero.rotate(BABYLON.Vector3.Up(), -heroRotationSpeed);
            bird.rotate(BABYLON.Vector3.Up(), -heroRotationSpeed);
            keydown = true;
          }
          if (inputMap["d"]) {
            hero.rotate(BABYLON.Vector3.Up(), heroRotationSpeed);
            bird.rotate(BABYLON.Vector3.Up(), heroRotationSpeed);
            keydown = true;
          }
          if (inputMap["b"]) {
            keydown = true;
          }
          if (keydown) {
            var heroPosition = hero.position.clone();
            var groundHeight = groundFromHm.getHeightAtCoordinates(
              heroPosition.x,
              heroPosition.z
            );
            hero.position.y = groundHeight;

            if (!animating) {
              animating = true;
              if (inputMap["s"]) {
                walkBackAnim.start(
                  true,
                  1.0,
                  walkBackAnim.from,
                  walkBackAnim.to,
                  false
                );
              } else if (inputMap["b"]) {
                sambaAnim.start(true, 1.0, sambaAnim.from, sambaAnim.to, false);
              } else {
                //Walk
                walkAnim.start(true, 1.0, walkAnim.from, walkAnim.to, false);
              }
            }
          } else {
            if (animating) {
              idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false);
              sambaAnim.stop();
              walkAnim.stop();
              walkBackAnim.stop();
              animating = false;
            }
          }
        });
      } else {
        console.error("Failed to load the HVGirl.glb model.");
      }
    }
  );

  var inputMap = {};
  scene.actionManager = new BABYLON.ActionManager(scene);
  scene.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnKeyDownTrigger,
      function (evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
      }
    )
  );
  scene.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnKeyUpTrigger,
      function (evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
      }
    )
  );

  const skybox = BABYLON.MeshBuilder.CreateBox(
    "skybox",
    { size: 1500.5 },
    scene
  );
  skybox.infiniteDistance = true;
  const skyboxMaterial = new BABYLON.StandardMaterial("skyboxMat", scene);
  skyboxMaterial.backFaceCulling = false;
  const files = [
    "images/skybox_px.jpg",
    "images/skybox_py.jpg",
    "images/skybox_pz.jpg",
    "images/skybox_nx.jpg",
    "images/skybox_ny.jpg",
    "images/skybox_nz.jpg",
  ];
  skyboxMaterial.reflectionTexture = BABYLON.CubeTexture.CreateFromImages(
    files,
    scene
  );
  skyboxMaterial.reflectionTexture.coordinatesMode =
    BABYLON.Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
  skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  skybox.material = skyboxMaterial;
  return scene;
};
const scene = await createScene();

engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});
