// import { FlakesTexture } from 'three/examples/jsm/Addons.js'
import Experience from '../Experience.js'
import Environment from './Environment.js'
import Floor from './Floor.js'
import Object from './Object.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.objects = []

        this.object_load_list = [['foxModel', ['idle', 'walking', 'running']],
                                 ['carModel', []]]
        this.current_obj_index = 0

        this.mode = 'object' // object, scene

        // Wait for resources
        this.resources.on('ready', () =>
        {
            // Setup
            this.floor = new Floor()
            const current_object = this.object_load_list[this.current_obj_index]
            this.objects.push(new Object(current_object[0], current_object[1]))
            // this.objects.push(new Object('foxModel', ['idle', 'walking', 'running']))
            // this.objects.push(new Object('carModel'))
            this.environment = new Environment()
        })
    }

    update(keyboard)
    {
        if (this.mode == 'object')
        {
            this.updateByKeyboard(keyboard)
        }

        for (const obj of this.objects)
        {
            if(obj)
            {
                obj.update()
            }
        }
    }

    updateByKeyboard(keyboard)
    {
        if (keyboard.wheel_ctrl && keyboard.wheel_ctrl_deltaY != 0)
        {
            if (keyboard.selectedObject)
            {
                keyboard.selectedObject.scale(keyboard)
            }
        }

        if (keyboard.press_key_s)
        {
            if (this.current_obj_index < this.object_load_list.length-1)
            {
                this.next_object(1)
            }
            keyboard.press_key_s = false
        }
        else if (keyboard.press_key_a)
        {
            if (this.current_obj_index > 0)
            {
                this.next_object(-1)
            }
            keyboard.press_key_a = false
        }
    }

    next_object(sign)
    {
        this.objects[0].destroy()
        this.objects[0] = null
        this.current_obj_index += sign
        const current_object = this.object_load_list[this.current_obj_index]
        this.objects[0] = new Object(current_object[0], current_object[1])
    }

    
}