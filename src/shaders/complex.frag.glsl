precision mediump float;

#ifdef USE_TEXTURE
    uniform sampler2D uTexture;
    varying vec2 vTextureCoord;
    varying float vTextureEnable;
#endif

uniform float uColorAlpha;
varying vec3 vLightWeighting;
varying vec3 vColor;
varying vec3 vEmissive;

void main(void) {
    vec4 color = vec4(vColor.rgb, uColorAlpha);
    float k = 0.0;
    float j = 1.0;

    #ifdef USE_TEXTURE
        if (vTextureEnable > 0.5) {
            vec4 textureColor = texture2D(uTexture, vec2(vTextureCoord.s, vTextureCoord.t));
            color = vec4(textureColor.rgb * color.rgb, color.a);

            float d = 0.02;

            if (vTextureCoord.t > 1.0 - d) {
                k = (vTextureCoord.t - 1.0 + d) / d;
            }

            if (vTextureCoord.t < d) {
                j = 1.0 - (d - vTextureCoord.t) / d;
            }
        }
    #endif

    vec3 c = min(color.rgb * vLightWeighting + vEmissive, vec3(1.0, 1.0, 1.0));


    #ifdef USE_TEXTURE
        if (vTextureEnable > 0.5) {
            c = k * (0.97 - c) + c;
        }
    #endif

    gl_FragColor = vec4(c, j * color.a);
}
