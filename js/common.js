(function () {
    function WX3D(id = 'container', url = 'http://jsonplaceholder.typicode.com/users') {
        this.table = [];
        this.id = id;
        this.url = url;
        this.MAXNUMBER = 0;
        this.RADIUS = 0;

        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.stats = null;
        this.controls = null;

        this.objects = [];
        this.targets = {
            sphere: []
        };
        this.zoomState = 0;
    }

    Object.assign(WX3D.prototype, {
        init: function () {
            this.getData((data) => {
                data = [
                    { avatar: "img/1.jpg" },
                    { avatar: "img/2.jpg" },
                    { avatar: "img/3.jpg" },
                    { avatar: "img/4.jpg" },
                    { avatar: "img/5.jpg" },
                    { avatar: "img/6.jpg" },
                    { avatar: "img/7.jpg" },
                    { avatar: "img/8.jpg" },
                    { avatar: "img/9.jpg" },
                    { avatar: "img/10.jpg" },
                    { avatar: "img/11.jpg" },
                    { avatar: "img/12.jpg" }
                ];
                if (data.length < 256) {
                    this.MAXNUMBER = 256;
                    this.RADIUS = 800;
                } else if (data.length < 512) {
                    this.MAXNUMBER = 512;
                    this.RADIUS = 1000;
                } else {
                    this.MAXNUMBER = 1024;
                    this.RADIUS = 1800;
                }
                var index;
                for (let i = 0; i < this.MAXNUMBER; i++) {
                    index = parseInt(Math.random() * data.length);
                    this.table.push(data[index]);
                }
                this.initScene();
                this.animate();
            });
        },
        getData: function (callback) {
            fetch(this.url)
                .then(response => response.json())
                .then(data => callback(data))
                .catch(error => console.log('error is', error));
        },
        initScene: function () {
            this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
            this.camera.position.z = 1400 + this.RADIUS;

            this.scene = new THREE.Scene();

            // table

            for (var i = 0; i < this.table.length; i++) {

                var element = document.createElement('div');
                element.className = 'element';
                element.style.background = `rgba(0,127,127,${(Math.random() * 0.5 + 0.25)}) url(${this.table[i].avatar}) no-repeat center center`;
                element.style.backgroundSize = `100% 100%`;

                var object = new THREE.CSS3DObject(element);
                object.position.x = Math.random() * 4000 - 2000;
                object.position.y = Math.random() * 4000 - 2000;
                object.position.z = Math.random() * 4000 - 2000;
                this.scene.add(object);
                this.objects.push(object);

            }

            // sphere

            var vector = new THREE.Vector3();
            var spherical = new THREE.Spherical();

            for (var i = 0, l = this.objects.length; i < l; i++) {

                var phi = Math.acos(-1 + (2 * i) / l);
                var theta = Math.sqrt(l * Math.PI) * phi;

                var object = new THREE.Object3D();

                spherical.set(this.RADIUS, phi, theta);

                object.position.setFromSpherical(spherical);

                vector.copy(object.position).multiplyScalar(2);

                object.lookAt(vector);

                this.targets.sphere.push(object);

            }

            this.renderer = new THREE.CSS3DRenderer();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            document.getElementById(this.id).appendChild(this.renderer.domElement);

            this.stats = new Stats();
            document.getElementById(this.id).appendChild(this.stats.dom);

            this.controls = new THREE.OrbitControls(this.camera);
            this.controls.autoRotateSpeed = 4;
            this.controls.rotateSpeed = 0.5;
            this.controls.minDistance = 500;
            this.controls.maxDistance = 6000;
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.04;
            this.controls.addEventListener('change', this.render.bind(this));

            var button = document.getElementById('zoom');
            button.addEventListener('click', () => {

                this.zoom();

            }, false);

            var button = document.getElementById('rotate');
            button.addEventListener('click', () => {

                this.rotate();

            }, false);

            this.transform(this.targets.sphere, 2000);

            //

            window.addEventListener('resize', this.onWindowResize.bind(this), false);

        },
        zoom: function () {
            var pos = this.camera.position;
            var duration = 2000;
            if (this.zoomState == 0) {
                new TWEEN.Tween(pos)
                    .to({
                        x: 0,
                        y: -120,
                        z: 200 + this.RADIUS
                    }, duration / 2)
                    .onUpdate(this.render.bind(this))
                    .start();
                this.zoomState = 1;
            } else {
                new TWEEN.Tween(pos)
                    .to({
                        x: 0,
                        y: 0,
                        z: 1400 + this.RADIUS
                    }, duration / 4)
                    .onUpdate(this.render.bind(this))
                    .start();
                this.zoomState = 0;
            }
        },
        rotate: function () {
            if (!this.controls.autoRotate) {
                this.controls.autoRotate = true;
            }
            if (this.controls.autoRotateSpeed == 4) {
                this.controls.autoRotateSpeed = 0.5;
            } else {
                this.controls.autoRotateSpeed = 4;
            }
        },
        transform: function (targets, duration) {

            TWEEN.removeAll();

            for (var i = 0; i < this.objects.length; i++) {

                var object = this.objects[i];
                var target = targets[i];

                new TWEEN.Tween(object.position)
                    .to({
                        x: target.position.x,
                        y: target.position.y,
                        z: target.position.z
                    }, Math.random() * duration + duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start();

                new TWEEN.Tween(object.rotation)
                    .to({
                        x: target.rotation.x,
                        y: target.rotation.y,
                        z: target.rotation.z
                    }, Math.random() * duration + duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start();

            }

            new TWEEN.Tween(this)
                .to({}, duration * 2)
                .onUpdate(this.render)
                .start();

            //相机推进
            /* var pos = camera.position;
            new TWEEN.Tween(pos)
                .to({
                    x: 0,
                    y: -120,
                    z: 1200
                }, duration / 2)
                .onUpdate(render)
                .delay(duration * 2)
                .start().onComplete(function(){
                    controls.autoRotate = true;
                }); */

        },
        onWindowResize: function () {

            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);

            this.render();

        },
        animate: function () {

            requestAnimationFrame(this.animate.bind(this));

            TWEEN.update();

            this.controls.update();

        },
        render: function () {
            this.stats.begin();
            this.renderer.render(this.scene, this.camera);
            this.stats.end();
        }
    })
    var wx3d = new WX3D();
    wx3d.init();
})()