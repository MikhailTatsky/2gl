import {vec3, mat3} from 'gl-matrix';
import Ray from './math/Ray';
import OrthographicCamera from './cameras/OrthographicCamera';
import PerspectiveCamera from './cameras/PerspectiveCamera';

export default class Raycaster {
    constructor(origin, direction, near, far) {
        this.precision = 0.0001;
        this.ray = new Ray(origin, direction);
        this.near = near || 0;
        this.far = far || Infinity;
    }

    setFromCamera(coords, camera) {
        if (camera instanceof PerspectiveCamera) {
            this.ray.origin = vec3.clone(camera.position);

            let direction = vec3.fromValues(coords[0], coords[1], 0.5);
            direction = camera.unproject(direction);
            vec3.sub(direction, direction, camera.position);
            vec3.normalize(direction, direction);
            this.ray.direction = direction;

        } else if (camera instanceof OrthographicCamera) {
            let origin = vec3.fromValues(coords[0], coords[1], -1);
            this.ray.origin = camera.unproject(origin);

            this.ray.direction = vec3.fromValues(0, 0, -1);

            let matrix3 = mat3.create();
            mat3.fromMat4(matrix3, camera.worldMatrix);
            vec3.transformMat3(this.ray.direction, this.ray.direction, matrix3);
            vec3.normalize(this.ray.direction, this.ray.direction);
        }
    }

    intersectObject(object, recursive) {
        var intersects = [];

        this._intersectObject(object, intersects, recursive);

        intersects.sort(this._descSort);

        return intersects;
    }

    intersectObjects(objects, recursive) {
        let intersects = [];

        for (let i = 0; i < objects.length; i++) {
            this._intersectObject(objects[i], intersects, recursive);
        }

        intersects.sort(this._descSort);

        return intersects;
    }

    _descSort(a, b) {
        return a.distance - b.distance;
    }

    _intersectObject(object, intersects, recursive) {
        object.raycast(this, intersects);

        if (recursive) {
            let children = object.children;

            for (let i = 0; i < children.length; i++) {
                this._intersectObject(children[i], intersects, true);
            }
        }
    }
}
