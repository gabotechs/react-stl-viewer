import React, { useEffect, useRef, useState } from "react"
import { Box3, BufferGeometry, DoubleSide, Group, Matrix4, Mesh } from "three";
import { GroupProps, MeshProps, MeshStandardMaterialProps, useFrame } from "@react-three/fiber";

export interface Point3D {
    x: number
    y: number
    z: number
}

export interface ModelDimensions {
    boundingRadius: number
    width: number
    length: number
    height: number
}

export interface Model3DProps extends Omit<GroupProps, "scale"> {
    scale?: number
    visible?: boolean
    geometry: BufferGeometry
    meshProps: MeshProps
    materialProps: MeshStandardMaterialProps
    onLoaded(dims: ModelDimensions, mesh: Mesh, group: Group): any
}

const Model3D: React.FC<Model3DProps> = (
    {
        scale = 1,
        visible,
        geometry,
        meshProps,
        materialProps: {
            opacity = 1,
            ...otherMaterialProps
        },
        onLoaded,
        ...otherProps
    }
) => {
    const mesh = useRef<Mesh>(null)
    const group = useRef<Group>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
    }, [geometry])

    useFrame(() => {
        if (!loading || !geometry.boundingSphere || !mesh.current || !group.current) return
        new Box3().setFromObject(mesh.current) // this appears to set the correct property on geometry.boundingBox
        const {min, max} = geometry.boundingBox || {min: {x: 0, y: 0, z: 0}, max: {x: 0, y: 0, z: 0}}
        geometry.computeVertexNormals()
        const dims = {
            width: max.x-min.x,
            length: max.y-min.y,
            height: max.z-min.z,
        }
        geometry.applyMatrix4(new Matrix4().makeTranslation(
            -min.x-dims.width/2,
            -min.y-dims.length/2,
            -min.z-dims.height/2
        ))
        onLoaded({
                ...dims,
                boundingRadius: geometry.boundingSphere.radius
            },
            mesh.current,
            group.current
        )
        setLoading(false)
    })

    return (
        <group ref={group} {...otherProps}>
            <mesh
                ref={mesh}
                scale={[scale, scale, scale]}
                castShadow={true}
                {...meshProps}
            >
                <primitive object={geometry} attach={"geometry"} />
                <meshStandardMaterial
                    side={DoubleSide}
                    opacity={visible ? (opacity):0}
                    {...otherMaterialProps}
                />
            </mesh>
        </group>
    )
}

export default Model3D
