MySample.main = (function() {
    'use strict';  
    let canvas = document.getElementById('canvas-main');
    let gl = canvas.getContext('webgl2');
    let previousTime = performance.now();
    let projection = {
        parallelProjection: new Float32Array([]),
        perspectiveProjection: new Float32Array([]),
    };
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
    projection.parallelProjection = new Float32Array([
        2 / (right - left), 0, 0, -((left + right) / (right - left)),
        0, 2 / (top - bottom), 0, -((top + bottom) / (top - bottom)),
        0, 0, -2 / (far - near),-((far + near) / (far - near)),
        0, 0, 0, 1
    ]);
    projection.perspectiveProjection = new Float32Array([
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
    let tetrahedronIndices = new Uint16Array([
        0, 1, 2, 1, 3, 2, 3, 0, 2, 1, 0, 3
    ]);
    let tetrahedronVertices = new Float32Array([
        0.5, 0.0, -4.0, //0
        1.0, 0.0, -2.0, //1 
        1.0, 2.0, -4.0, //2
        1.5, 0.0, -4.0, //3
    ]);
    let tetrahedronVertexColors = new Float32Array([
        1.0, 0.0, 0.0,
        0.0, 0.0, 4.0,
        0.0, 2.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 0.0, 1.0,
        0.0, 0.5, 0.5,
    ]);
    let cubeVertices = new Float32Array([
        0.5, 0.5, -2.5, //0
        -0.5, 0.5, -2.5, //1
        -0.5, -0.5, -2.5, //2
        0.5, -0.5, -2.5, //3
        0.5, 0.5, -3.5, //4 
        -0.5, 0.5, -3.5, //5
        -0.5, -0.5, -3.5, //6
        0.5, -0.5, -3.5, //7
    ])
    let cubeIndices = new Uint16Array([
        0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4, 4, 0, 3, 3, 7, 4, 5, 1, 2, 2, 6, 5, 1, 5, 4, 1, 0, 4, 2, 6, 7, 2, 3, 7
    ]);
    let cubeColors = new Float32Array([
        1.0, 0.0, 0.0,
        0.0, 0.0, 4.0,
        0.0, 2.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 0.0, 1.0,
        0.0, 0.5, 0.5,
        1.0, 0.0, 0.0,
        0.0, 0.0, 4.0,
        0.0, 2.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 0.0, 1.0,
        0.0, 0.5, 0.5,
        1.0, 0.0, 0.0,
        0.0, 0.0, 4.0,
        0.0, 2.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 0.0, 1.0,
        0.0, 0.5, 0.5,
        1.0, 0.0, 0.0,
        0.0, 0.0, 4.0,
        0.0, 2.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 0.0, 1.0,
        0.0, 0.5, 0.5,
        1.0, 0.0, 0.0,
        0.0, 0.0, 4.0,
        0.0, 2.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 0.0, 1.0,
        0.0, 0.5, 0.5,
        1.0, 0.0, 0.0,
        0.0, 0.0, 4.0,
        0.0, 2.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 0.0, 1.0,
        0.0, 0.5, 0.5,
    ]);
    let octahedronVertices = new Float32Array([
        0.0, 0.0, -2.0, //0
        1.0, 0.0, -3.0, //1
        0.0, 1.0, -3.0, //2 
        -1.0, 0.0, -3.0, //3
        0.0, 0.0, -4.0, //4
        0.0, -1.0, -3.0, //5
    ]);
    let octahedronIndices = new Uint16Array([
        0, 1, 2, 0, 2, 3, 1, 4, 2, 4, 3, 2, 0, 5, 1, 0, 3, 5, 4, 3, 5, 4, 1, 5
    ]);
    let octahedronColors = new Float32Array([
        1.0, 0.0, 0.0,
        0.0, 0.0, 4.0,
        0.0, 2.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 0.0, 1.0,
        0.0, 0.5, 0.5,
        1.0, 0.0, 0.0,
        0.0, 0.0, 4.0,
        0.0, 2.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 0.0, 1.0,
        0.0, 0.5, 0.5,
        1.0, 0.0, 0.0,
        0.0, 0.0, 4.0,
        0.0, 2.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 0.0, 1.0,
        0.0, 0.5, 0.5,
        1.0, 0.0, 0.0,
        0.0, 0.0, 4.0,
        0.0, 2.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 0.0, 1.0,
        0.0, 0.5, 0.5,
    ]);
    let vertexBuffer = gl.createBuffer();
    let vertexColorBuffer = gl.createBuffer();
    let indexBuffer = gl.createBuffer();
    let theta = 0;
    let proj = projection.perspectiveProjection;
    let verts = octahedronVertices;
    let inds = octahedronIndices;
    let colorz = octahedronColors;
    function update(elapsedTime) {
        let yzRotation = new Float32Array([
            1, 0, 0, 0,
            0, Math.cos(.5), -Math.sin(.5), 0,
            0, Math.sin(.5), Math.cos(.5), -1,
            0, 0, 0, 1
        ]);
        let xzRotation = new Float32Array([
            Math.cos(theta), 0, Math.sin(theta), 0,
            0, 1, 0, 0,
            -Math.sin(theta), 0, Math.cos(theta), 0,
            0, 0, 0, 1
        ]);
        let xyRotation = new Float32Array([
            Math.cos(theta), -Math.sin(theta), 0, 0,
            Math.sin(theta), Math.cos(theta), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        let rot = xzRotation;

            verts = cubeVertices;
            inds = cubeIndices;
            colorz = cubeColors;
            proj = projection.perspectiveProjection;
            rot = xzRotation
        
        // }else if(theta > 5 && theta <= 10) {
        //     proj = projection.parallelProjection;
        //     rot = xzRotation
        // }else if(theta > 10 && theta <= 15){
        //     verts = tetrahedronVertices;
        //     inds = tetrahedronIndices;
        //     colorz = tetrahedronVertexColors;
        //     proj = projection.perspectiveProjection;
        //     rot = xzRotation
        // }else if (theta > 15 && theta <= 20){
        //     proj = projection.parallelProjection;
        //     rot = xzRotation
        // }else if (theta > 20 && theta <= 25){
        //     verts = cubeVertices;
        //     inds = cubeIndices;
        //     colorz = cubeColors;
        //     proj = projection.perspectiveProjection;
        //     rot = xzRotation;
        // }else if (theta > 25 && theta <= 30){
        //     proj = projection.parallelProjection;
        //     rot = xzRotation;

        theta += elapsedTime / 1000;
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colorz, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, inds, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        let vertexShaderSource = `#version 300 es
        in vec4 aPosition;
        in vec4 aColor;
        uniform mat4 mProjection;
        uniform mat4 mView;
        uniform mat4 mModel;
        out vec4 vColor;
        void main()
        {
        gl_Position = mProjection * mView * mModel * aPosition;
        vColor = aColor;
        }`;
        let fragmentShaderSource = `#version 300 es
        precision lowp float;
        in vec4 vColor;
        out vec4 outColor;
        void main()
        {
        outColor = vColor;
        }`;
        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        let shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);
        let mProjection = gl.getUniformLocation(shaderProgram, "mProjection");
        gl.uniformMatrix4fv(mProjection, false, transposeMatrix4x4(proj));
        let mView = gl.getUniformLocation(shaderProgram, "mView");
        gl.uniformMatrix4fv(mView, false, transposeMatrix4x4(view));
        let mModel = gl.getUniformLocation(shaderProgram, "mModel");
        let translation = multiplyMatrix4x4(translate1, rot);
        model = multiplyMatrix4x4(translation, translate2);
        gl.uniformMatrix4fv(mModel, false, transposeMatrix4x4(model));
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        let position = gl.getAttribLocation(shaderProgram, 'aPosition');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, verts.BYTES_PER_ELEMENT * 3, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        let color = gl.getAttribLocation(shaderProgram, 'aColor');
        gl.enableVertexAttribArray(color);
        gl.vertexAttribPointer(color, 3, gl.FLOAT, false, colorz.BYTES_PER_ELEMENT * 3, 0);
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
        gl.drawElements(gl.TRIANGLES, inds.length, gl.UNSIGNED_SHORT, 0);
    }
    function animationLoop(time) {
        let elapsedTime = time - previousTime;
        previousTime = time
        update(elapsedTime);
        render();
        requestAnimationFrame(animationLoop);
    }
    console.log('initializing...');
    requestAnimationFrame(animationLoop);
}());
