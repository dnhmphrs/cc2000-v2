uniform float u_time;
uniform vec2 u_resolution;

varying vec2 vUv;

void main() {
    // Create animated gradient effect
    vec2 st = vUv;
    
    // Animated color based on time and position
    float r = 0.5 + 0.5 * sin(u_time + st.x * 3.0);
    float g = 0.5 + 0.5 * sin(u_time + st.y * 3.0 + 2.0);
    float b = 0.5 + 0.5 * cos(u_time + (st.x + st.y) * 2.0);
    
    vec3 color = vec3(r, g, b);
    
    gl_FragColor = vec4(color, 1.0);
}