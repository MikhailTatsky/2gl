attribute vec3 position;

uniform mat4 uPosition;
uniform mat4 uCamera;
uniform vec4 uColor;

varying vec4 vColor;

void main(void) {
    vColor = uColor;

    gl_Position = uCamera * uPosition * vec4(position, 1.0);
}
