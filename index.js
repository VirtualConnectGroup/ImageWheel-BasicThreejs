/* ****BUILD CIRCLES **** */
const image_radius = 100;
const number_of_images = 8;
const radius = 400;
const radian_interval = (2.0 * Math.PI) / number_of_images;
const center_of_wheel = {
  x: 0,
  y: 0
};

// Create the scene and a camera to view it
const scene = new THREE.Scene();
scene.background = null;

const group_cards = new THREE.Group();
let loader = null;
let texture = null;
let material = null;
let circle = null;
let mesh = null;

for (let i = 0; i < number_of_images; i++) {
  // Create a texture loader so we can load our image file
  loader = new THREE.TextureLoader();
  texture = loader.load("AppleLogo.png");
  texture.minFilter = THREE.LinearFilter;

  // Load an image file into a custom material
  material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 1
  });

  circle = new THREE.CircleGeometry(image_radius, 100);
  mesh = new THREE.Mesh(circle, material);

  mesh.material.side = THREE.DoubleSide;

  mesh.position.set(
    center_of_wheel.x + Math.cos(radian_interval * i) * radius,
    center_of_wheel.y + Math.sin(radian_interval * i) * radius,
    0
  );

  // add the image to the group
  group_cards.add(mesh);
}

// add group to scene
scene.add(group_cards);

// Specify the portion of the scene visible at any time (in degrees)
let fieldOfView = 75;

let aspectRatio = window.innerWidth / window.innerHeight;
let nearPlane = 0.1;
let farPlane = 1000;
let camera = new THREE.PerspectiveCamera(
  fieldOfView,
  aspectRatio,
  nearPlane,
  farPlane
);
camera.position.z = 1000;

/* ***RENDER & LISTEN** */

let renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);

document.querySelector("body").appendChild(renderer.domElement);

let wheel_theta = 0.0;
let spin_in_progress = false;
let snap_in_progress = false;
const snap_point = {
  x: Math.floor(group_cards.children[2].position.x),
  y: Math.floor(group_cards.children[2].position.y),
  theta: 0
};

snap_point.theta = Math.abs(Math.atan2(snap_point.y, snap_point.x));

let active_cards_index = 0;

function snap_back() {
  snap_in_progress = true;
  let shortest_distance = Math.sqrt(
    Math.pow(group_cards.children[3].getWorldPosition().x - snap_point.x, 2) +
      Math.pow(group_cards.children[3].getWorldPosition().y - snap_point.y, 2)
  );

  for (let i = 0; i < group_cards.children.length; i++) {
    let dx = Math.pow(
      group_cards.children[i].getWorldPosition().x - snap_point.x,
      2
    );
    let dy = Math.pow(
      group_cards.children[i].getWorldPosition().y - snap_point.y,
      2
    );
    let current_distance = Math.sqrt(dx + dy);

    if (shortest_distance >= current_distance) {
      shortest_distance = current_distance;
      active_cards_index = i;
    }
  }

  const closest_cards_x = group_cards.children[
    active_cards_index
  ].getWorldPosition().x;
  const closest_cards_y = group_cards.children[
    active_cards_index
  ].getWorldPosition().y;
  const closest_cards_theta = Math.abs(
    Math.atan2(closest_cards_y, closest_cards_x)
  );

  let theta_between =
    snap_point.theata >= closest_cards_theta
      ? snap_point.theta - closest_cards_theta
      : closest_cards_theta - snap_point.theta;

  //decide wheater to make a position or negative degree shirt
  if (closest_cards_x > 0.0 && closest_cards_y >= 0.0) {
    //QI
    theta_between =
      closest_cards_theta > snap_point.theata
        ? -1.0 * theta_between
        : theta_between;
  } else if (closest_cards_x <= 0.0 && closest_cards_y >= 0.0) {
    //QII
    theta_between =
      closest_cards_theta > snap_point.theata
        ? -1.0 * theta_between
        : theta_between;
  } else if (closest_cards_x <= 0.0 && closest_cards_y < 0.0) {
    //QIII
    theta_between =
      Math.PI + (Math.PI - closest_cards_theta) > snap_point.theata
        ? -1.0 * theta_between
        : theta_between;
  } else if (closest_cards_x > 0.0 && closest_cards_y <= 0.0) {
    //QIV
    theta_between =
      2.0 * Math.PI - closest_cards_theta > snap_point.theata
        ? -1.0 * theta_between
        : theta_between;
  }

  setTimeout(() => {
    target = theta_between;
    wheel_theta = group_cards.rotation.z;
    snap_in_progress = true;
  }, 100);

  console.log(active_cards_index);
  console.log(shortest_distance);
}

let scroll_speed = 0.0;
document.addEventListener("wheel", (event) => {
  if (snap_in_progress) {
    return;
  } else {
  }
  clearTimeout(spin_in_progress);

  scroll_speed = event.deltaY * (Math.PI / 180) * 0.2;

  group_cards.rotation.z += -1.0 * scroll_speed;

  for (let i = 0; i < group_cards.children.length; i++) {
    group_cards.children[i].rotation.z += scroll_speed;
  }

  spin_in_progress = setTimeout(() => {
    snap_back();
  }, 1000);
});

let target = 0.0;
let clock = new THREE.Clock();
let delta = 0.0;
let duration = 3;
let current_time = duration;

requestAnimationFrame(animate);

function animate() {
  delta = clock.getDelta();

  if (snap_in_progress) {
    current_time -= delta;

    if (current_time < 0) {
      current_time = duration;
      snap_in_progress = false;
      wheel_theta = group_cards.rotation.z;
      target = 0;
    } else {
      group_cards.rotation.set(
        0,
        0,
        wheel_theta + target * (1.0 - current_time / duration)
      );

      for (let i = 0; i < group_cards.children.length; i++) {
        group_cards.children[i].rotation.set(
          0,
          0,
          -1.0 * (wheel_theta + target * (1.0 - current_time / duration))
        );

        i === active_cards_index
          ? group_cards.children[active_cards_index].scale.set(
              1 + 1 * (1.0 - current_time / duration),
              1 + 1 * (1.0 - current_time / duration),
              1
            )
          : group_cards.children[i].scale.set(
              1 - 0.2 * (1.0 - current_time / duration),
              1 - 0.2 * (1.0 - current_time / duration),
              1
            );
      }
    }
  }

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
