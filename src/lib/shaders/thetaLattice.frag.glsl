precision highp float; // Use medium precision for balance between quality and performance
varying vec2 vUv;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec2 mouse;
uniform float aspectRatio;

// Function to create a symmetric and positive definite matrix
mat3 createDynamicOmega(vec2 mouse) {
    float a = tanh(3.14159 * log(abs(mouse.x ) + 0.001));
    float b = tanh(3.14159 * log(abs(mouse.y ) + 0.001));
    float c = a * b * 0.5; // coupling / shear term
    
    // Symmetric positive definite with off-diagonal coupling
    return mat3(
        1.0 + a,  c,       c * 0.5,
        c,        1.0 + b, c * 0.5,
        c * 0.5,  c * 0.5, 1.0 
    );
}


const int N = 3; // Reduced number of terms in the series for better performance

// Function to compute the real part of the Riemann theta function
float riemannThetaReal(vec3 z, mat3 Omega) {
    float sum = 0.0;

    // Iterate over the range of n values for 3 dimensions
    for (int n1 = -N; n1 <= N; ++n1) {
        for (int n2 = -N; n2 <= N; ++n2) {
            for (int n3 = -N; n3 <= N; ++n3) {
                vec3 n = vec3(float(n1), float(n2), float(n3));

                // Compute n^T * Omega * n
                float nt_Omega_n = dot(n, Omega * n);

                // Compute 2 * n^T * z
                float nt_z = 2.0 * dot(n, z);

                // Compute the real part of the exponential term
                float exponent = 3.14159 * (nt_Omega_n + nt_z);
                float realPart = tan(exponent); // Use cosine for the real part

                sum += realPart;
            }
        }
    }

    return sum;
}

// Quaternion from mouse position
vec4 mouseToQuat(vec2 mouse) {
    float angle = length(mouse) * 3.14159;
    float halfAngle = angle * 0.5;
    vec3 axis = normalize(vec3(mouse.x * mouse.y, mouse.x * mouse.y, mouse.x * mouse.y)); // avoid zero
    return vec4(axis * sin(halfAngle), cos(halfAngle));
}

// Rotate a vector by a quaternion
vec3 rotateByQuat(vec3 v, vec4 q) {
    vec3 u = q.xyz;
    float s = q.w;
    return 2.0 * dot(u, v) * u
         + (s*s - dot(u,u)) * v
         + 2.0 * s * cross(u, v);
}

void main() {
    // Map the fragment coordinates to the complex plane
    float x = vUv.x * 0.05 - 0.025;
    float y = vUv.y * 0.05 - 0.025;

    // Create a dynamic Riemann matrix based on mouse input
    mat3 OmegaDynamic = createDynamicOmega(mouse); // createDynamicOmega(mouse);

    // Construct a 3D vector for the z variable
    // vec3 z = vec3(x, y, x * y); // Static third component

    vec4 q = mouseToQuat(mouse);
    vec3 baseSlice = vec3(x, y, 0.0); // flat probe plane
    vec3 z = rotateByQuat(baseSlice, q); // rotate it through the volume

    // float accum = 0.0;
    // int STEPS = 8;
    // for (int i = 0; i < STEPS; i++) {
    //     float t = (float(i) / float(STEPS)) - 0.5;
    //     vec3 z = vec3(x, y, t * 0.05);
    //     accum += riemannThetaReal(z, OmegaDynamic);
    // }
    // float thetaValueReal = accum / float(STEPS);

    // Calculate the real part of the Riemann theta function at z
    float thetaValueReal = riemannThetaReal(z, OmegaDynamic);

    // Normalize thetaValue to map to color range
    float normalizedTheta = 0.5 + 0.5 * tanh(thetaValueReal);

    // Create gradients for visualization
    vec3 gradient1 = mix(color1, color1, log(normalizedTheta));
    vec3 gradient2 = mix(color1, gradient1, log(normalizedTheta));
    

    gl_FragColor = vec4(gradient2, 1.0);
}