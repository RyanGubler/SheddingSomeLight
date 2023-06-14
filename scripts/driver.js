MySample.main = (function() {
    'use strict';  
    let canvas = document.getElementById('canvas-main');
    let gl = canvas.getContext('webgl2');
    let previousTime = performance.now();
    let indices = [];
    let vertices = [];
    let normals = [];
    let adjacent = [];
    let view = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
    let right = 1;
    let left = -1;
    let top = 1;
    let bottom = -1;
    let near = 1;
    let far = 10;
    let lAmbient = new Float32Array([
        1,
        0,
        0
    ]);
    let lDiffuse = new Float32Array([
        0,
        1,
        0
    ]);
    let mAmbient = new Float32Array([
        1,
        0,
        0
    ]);
    let mDiffuse = new Float32Array([
        0,
        1,
        0
    ]);
    let translate1 = new Float32Array ([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, -3,
        0, 0, 0, 1
    ]);
    let translate2 = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 3,
        0, 0, 0, 1
    ]);
    let perspectiveProjection = new Float32Array([
        near / right, 0, 0, 0,
        0, near / top, 0, 0,
        0, 0, -(far + near) / (far - near), (-2 * far * near) / (far - near),
        0, 0, -1, 0
    ]);
    let model = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
    let vertexBuffer = gl.createBuffer();
    let normalBuffer = gl.createBuffer();
    let indexBuffer = gl.createBuffer();
    let shaderProgram = gl.createProgram();
    async function bufferAndShader(){
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        let vertexShaderSource = await loadFileFromServer("shaders/simpleVert.vert");
        let fragmentShaderSource = await loadFileFromServer("shaders/simpleFrag.frag");
        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        let position = gl.getAttribLocation(shaderProgram, 'aPosition');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, vertices.BYTES_PER_ELEMENT * 3, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        let normal = gl.getAttribLocation(shaderProgram, 'aNormal');
        gl.enableVertexAttribArray(normal);
        gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, normals.BYTES_PER_ELEMENT * 3, 0);

        requestAnimationFrame(animationLoop);
        
    }
    async function loadFile(filename, splitData, elementFaceResult, verticeResult, adjacentFace){
        let file = await loadFileFromServer(filename);
        let data = file.split("end_header");
        let elementVertex = data[1];
        let elementFace = elementVertex.split(splitData).map(elementVertex => elementVertex + splitData);
        elementVertex = elementFace[0].split(/\r?\n/);
        elementVertex = elementVertex.map(stringData => {
            let values = stringData.split(" ").slice(0, 3);
            return values;
        });
        elementFace = elementFace[1].split(/\r?\n/);
        elementFace.shift();
        elementFace = elementFace.map(str => str.substring(2));
        for (let i = 0; i < elementFace.length - 1; i++) {
            for (let j = 0; j < 3; j++){
                elementFaceResult.push(elementFace[i][j]);
                if(adjacentFace[elementFace[i][j]] !== undefined){
                    adjacentFace[elementFace[i][j]].push(...elementFace[i])
                }else{
                    adjacentFace[indices[i][j]] = [...indices[i]];
                }
            }
        }
        verticeResult = new Float32Array(elementVertex);
        elementFaceResult = new Uint32Array(elementFaceResult);
        bufferAndShader();
    }
    let theta = 0;
    async function update(elapsedTime) {
        let xzRotation = new Float32Array([
            Math.cos(theta), 0, Math.sin(theta), 0,
            0, 1, 0, 0,
            -Math.sin(theta), 0, Math.cos(theta), 0,
            0, 0, 0, 1
        ]);
        theta += elapsedTime / 1000;

        model = xzRotation;
        let mProjection = gl.getUniformLocation(shaderProgram, "mProjection");
        gl.uniformMatrix4fv(mProjection, false, transposeMatrix4x4(perspectiveProjection));
        let mView = gl.getUniformLocation(shaderProgram, "mView");
        gl.uniformMatrix4fv(mView, false, transposeMatrix4x4(view));
        let mModel = gl.getUniformLocation(shaderProgram, "mModel");
        let translation = multiplyMatrix4x4(translate1, xzRotation);
        model = multiplyMatrix4x4(translation, translate2);
        gl.uniformMatrix4fv(mModel, false, transposeMatrix4x4(model));
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    }
    function render() {
        gl.clearColor(
            0.3921568627450980392156862745098,
            0.58431372549019607843137254901961,
            0.92941176470588235294117647058824,
            1.0
        );
        gl.clearDepth(1.0);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
    }
    function animationLoop(time) {
        let elapsedTime = time - previousTime;
        previousTime = time
        update(elapsedTime);
        render();
        requestAnimationFrame(animationLoop);
    }
    console.log('initializing...');
    loadFile("models/buddha.ply", "-0.0043935 0.067325 0.046655", indices, vertices, adjacent)
}());
