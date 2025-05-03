import * as THREE from 'three'
import Experience from '../Experience.js'

export default class KeyboardMouse
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera.instance
        this.controls = this.experience.camera.controls
        this.renderer = this.experience.renderer.instance
        this.objects = this.experience.world.objects

        // mouse wheel
        this.wheel_ctrl = false
        this.wheel_ctrl_deltaY = 0
        this.selectedObject = null
        this.press_key_s = false
        this.press_key_a = false

        window.addEventListener('wheel', (event) => {
            this.onWheel(event)
        }, { passive: false })

        // mouse click
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()

        window.addEventListener('click', (event) => {
            this.onClick(event)
        })

        // keyboard
        window.addEventListener('keydown', (event) => {
            if (event.key === 's' || event.key === 'S') {
                console.log('S key was pressed')
                this.press_key_s = true
            }
            else if (event.key === 'a' || event.key === 'A') {
                console.log('A key was pressed')
                this.press_key_a = true
            }
        })
    }

    getNormalizedDelta(event) 
    {
        let delta = event.deltaY;
      
        switch (event.deltaMode) 
        {
          case WheelEvent.DOM_DELTA_LINE:
            delta *= 16; // Convert line units to pixel values (typically 1 line ≈ 16px)
            break;
          case WheelEvent.DOM_DELTA_PAGE:
            delta *= window.innerHeight; // Convert page units to pixel values
            break;
        }
      
        return delta;
    }

    reset()
    {
        // mouse wheel
        this.wheel_ctrl = false
        this.wheel_ctrl_deltaY = 0
        // this.selectedObject = null
        this.press_key_s = false
        this.press_key_a = false
    }

    onWheel(event)
    {
        if (event.ctrlKey) 
        {
            event.preventDefault()
            this.controls.enableZoom = false
            this.wheel_ctrl = true
            this.wheel_ctrl_deltaY = this.getNormalizedDelta(event);
        }
        else
        {
            this.wheel_ctrl = false
            this.wheel_ctrl_deltaY = 0
            this.controls.enableZoom = true
        }
    }

    onClick(event)
    {
        this.selectedObject = null
        
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        this.raycaster.setFromCamera(this.mouse, this.camera)

        const intersects = this.raycaster.intersectObjects(this.scene.children, true)

        if (intersects.length > 0) 
        {
            const firstObject = intersects[0].object

            // 這裡可以比對是不是你想要的Car
            console.log('點到物件:', firstObject.name || firstObject)

            let selected = true
            for (const obj of this.objects)
            {
                if(obj)
                {
                    // console.log(firstObject.parent.uuid, obj.model.uuid)
                    let currentParent = firstObject.parent
                    while (currentParent) 
                    {
                        if (currentParent === obj.model) 
                        {
                            console.log('Selected model', firstObject.name)
                            this.selectedObject = obj
                            selected = true
                            break
                        }
                        currentParent = currentParent.parent
                    }
                }

                if (selected)
                    break
            }

            
        }
    }
}
