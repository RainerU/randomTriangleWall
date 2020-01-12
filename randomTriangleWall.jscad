// randomTriangleWall.jscad
// Generate Tiles for a background-wall with a rough looking random surface.
//
// (c) Rainer Urlacher 2020
//
// this software is published for the public domain under the MIT License
// on github: https://github.com/RainerU/RandomTriangleWall
//
// usage:
// - modify constants (line 13..30) as desired
// - drag and drop this file into the field on https://www.openjscad.org

// number of rows/columns
const nx = 28
const ny = 28;
// x/y grid pitch
const px = 10;
const py = 10;
// average height of surface
const hz = 10;
// max. random variation of surface points, 10 means -5 to +5
const vx = 5;
const vy = 5;
const vz = 5;
// boundary style: 0 = random, 1 = stackable, 2 = even
// <stackable> means, opposite sides are aligned to allow stacking of identical tiles
// <even> means, no random effects at the boundary; this makes different tiles stackable
const boundary = 0;
// rotate surface triangles randomly, select 0 or 1, 0 creates a diagonal grain
const randomTriangles = 1;

function main() {
	let points = [];
	let triangles = [];
	// set surface-points to random numbers
	for (let i=0; i<(ny+1)*(nx+1); i++)
		points.push([(Math.random()-0.5)*vx, (Math.random()-0.5)*vy, (Math.random()-0.5)*vz]);
	if (boundary == 1) { // make stackable tiles, align opposite sides
		for (let ix=0; ix<=nx; ix++) points[ny*(nx+1)+ix] = points[ix];
		for (let iy=0; iy<=ny; iy++) points[(iy+1)*(nx+1)-1] = points[iy*(nx+1)];
	} else if (boundary == 2) { // remove random numbers from boundaries
		for (let ix=0; ix<=nx; ix++) { points[ix] = [0,0,0]; points[ny*(nx+1)+ix] = [0,0,0]; };
		for (let iy=0; iy<=ny; iy++) { points[(iy+1)*(nx+1)-1] = [0,0,0]; points[iy*(nx+1)] = [0,0,0]; };
	};
	// add grid coordinates to random numbers of sufrace-points and create triangles
	for (let iy=0; iy<=ny; iy++) {
		for (let ix=0; ix<=nx; ix++) {
			points[iy*(nx+1)+ix] = [points[iy*(nx+1)+ix][0] + ix*px,
			                        points[iy*(nx+1)+ix][1] + iy*py,
			                        points[iy*(nx+1)+ix][2] + hz];
			if (ix > 0 && iy > 0) {
				if (Math.random() < 0.5 || !randomTriangles) {
					triangles.push([(iy-1)*(nx+1)+ix-1, iy*(nx+1)+ix-1, iy*(nx+1)+ix]);
					triangles.push([(iy-1)*(nx+1)+ix, (iy-1)*(nx+1)+ix-1, iy*(nx+1)+ix]);
				} else {
					triangles.push([(iy-1)*(nx+1)+ix-1, iy*(nx+1)+ix-1, (iy-1)*(nx+1)+ix]);
					triangles.push([(iy-1)*(nx+1)+ix, iy*(nx+1)+ix-1, iy*(nx+1)+ix]);
				}
			};
		};
	};
	// create boundary triangles
	points.push([0, 0, 0]);
	let bndStart = points.length-1;
	for (let ix=1; ix<=nx; ix++) { // front
		points.push([ix*px, 0, 0]);
		triangles.push([points.length-2, ix-1, points.length-1]);
		triangles.push([points.length-1, ix-1, ix]);
	};
	for (let iy=1; iy<=ny; iy++) { // right
		points.push([nx*px, iy*py, 0]);
		triangles.push([points.length-2, iy*(nx+1)-1, points.length-1]);
		triangles.push([points.length-1, iy*(nx+1)-1, (iy+1)*(nx+1)-1]);
	};
	for (let ix=nx-1; ix>=0; ix--) { // back
		points.push([ix*px, ny*py, 0]);
		triangles.push([points.length-2, ny*(nx+1)+ix, points.length-1]);
		triangles.push([points.length-2, ny*(nx+1)+ix+1, ny*(nx+1)+ix]);
	};
	for (let iy=ny-1; iy>=0; iy--) { // left
		points.push([0, iy*py, 0]);
		triangles.push([points.length-2, iy*(nx+1), points.length-1]);
		triangles.push([points.length-2, (iy+1)*(nx+1), iy*(nx+1)]);
	};
	// create bottom plate
	triangles.push([bndStart, bndStart+nx, bndStart+nx+ny]);
	triangles.push([bndStart, bndStart+nx+ny, bndStart+nx+ny+nx]);
	// that is it, we can return a polyhedron of points and triangles
	return translate([-nx*px/2,-ny*py/2,0], polyhedron({points: points, triangles: triangles}));
};
