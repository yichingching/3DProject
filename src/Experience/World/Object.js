import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Object
{
    constructor(model_name, animation_names = [])
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.animation_names = animation_names

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder(model_name)
        }

        // Resource
        this.resource = this.resources.items[model_name]

        this.setModel()
        this.setAnimation()
    }

    setModel()
    {
        this.model = this.resource.scene
        // this.model = this.resource.scene.clone(true)
        
        // reset transform
        this.model.position.set(0, 0, 0)
        this.model.rotation.set(0, 0, 0)
        this.model.scale.set(0.02, 0.02, 0.02)
        
        // calibrate init position
        this.boundingBox = new THREE.Box3().setFromObject(this.model)
        const offsetY = -this.boundingBox.min.y
        this.model.position.set(0.0, 0.0, 0.0)
        this.model.position.y += offsetY
        this.boundingBox = new THREE.Box3().setFromObject(this.model)

        // show bounding box
        // const boxHelper = new THREE.Box3Helper(this.boundingBox, 0xff0000)
        // this.scene.add(boxHelper)

        this.scene.add(this.model)

        this.model.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
            }
        })
    }

    setAnimation()
    {
        if (this.animation_names.length == 0)
            return

        this.animation = {}
        
        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        
        // Actions
        this.animation.actions = {}

        for (const [index, value] of this.animation_names.entries()) 
        {
            this.animation.actions[value] = this.animation.mixer.clipAction(this.resource.animations[index])
        }
        
        // this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])
        // this.animation.actions.walking = this.animation.mixer.clipAction(this.resource.animations[1])
        // this.animation.actions.running = this.animation.mixer.clipAction(this.resource.animations[2])
        
        // default animation
        this.animation.actions.current = this.animation.actions[this.animation_names[0]]
        this.animation.actions.current.play()
        

        // Play the action
        this.animation.play = (name) =>
        {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction
        }

        // Debug
        if(this.debug.active)
        {
            // const debugObject = {
            //     playIdle: () => { this.animation.play('idle') },
            //     playWalking: () => { this.animation.play('walking') },
            //     playRunning: () => { this.animation.play('running') }
            // }

            // this.debugFolder.add(debugObject, 'playIdle')
            // this.debugFolder.add(debugObject, 'playWalking')
            // this.debugFolder.add(debugObject, 'playRunning')

            let debugObject = {}
            this.animation_names.forEach((animationName) => {
                const capitalized = animationName.charAt(0).toUpperCase() + animationName.slice(1);
                const functionName = 'play' + capitalized;
              
                debugObject[functionName] = () => {
                  this.animation.play(animationName)
                }
                this.debugFolder.add(debugObject, functionName)
              })
        }
    }

    update()
    {
        if (this.animation)
        {
            this.animation.mixer.update(this.time.delta * 0.001)
        }
    }

    scale(keyboard)
    {
        if (this.model == null)
            return

        let model = this.model
        let scale = model.scale
        let position = model.position
        
        let boundingBox = new THREE.Box3().setFromObject(model)

        let minY = boundingBox.min.y
        let maxY = boundingBox.max.y

        let deltaScale = 1 - keyboard.wheel_ctrl_deltaY * 0.001;
        deltaScale = Math.max(0.1, Math.min(deltaScale, 10));

        scale.x *= deltaScale
        scale.y *= deltaScale
        scale.z *= deltaScale

        boundingBox = new THREE.Box3().setFromObject(model)
        let newMinY = boundingBox.min.y

        position.y -= (newMinY - minY)

        model.scale.set(scale.x, scale.y, scale.z)
        model.position.set(position.x, position.y, position.z)
    }

    destroy()
    {
        // stop animation
        if (this.animation && this.animation.mixer) 
        {
            this.animation.mixer.stopAllAction()
        }

        // release mesh
        this.model.traverse((child) => 
        {
            if (child.isMesh) {
                if (child.geometry) {
                    child.geometry.dispose()
                }

                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose())
                    } else {
                        child.material.dispose()
                    }
                }
            }
        });

        // remove model from scene
        if (this.model && this.scene) 
        {
            this.scene.remove(this.model)
        }

        // remove animation
        if (this.animation && this.animation.mixer) 
        {
            this.animation.mixer.uncacheRoot(this.model)
            this.animation.mixer = null
            this.animation.actions = null
            this.animation = null
        }

        // Debug UI
        if (this.debug.active && this.debugFolder) 
        {
            this.debugFolder.destroy()
            this.debugFolder = null
        }

        this.model = null
        this.resource = null
    }
}