import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei';

export default function FloatingForm() {
  const meshRef = useRef();

  // Subtle mouse tracking logic
  useFrame((state) => {
    if (!meshRef.current) return;
    const { x, y } = state.mouse;
    meshRef.current.rotation.x = y * 0.2;
    meshRef.current.rotation.y = x * 0.2;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef} scale={1.5}>
          {/* A rounded 'document' shape using a box with distortion */}
          <boxGeometry args={[1, 1.4, 0.1]} />
          <MeshDistortMaterial
            color="#6366f1"
            speed={2}
            distort={0.2}
            radius={1}
            emissive="#4338ca"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>
    </>
  );
}