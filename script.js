document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable');
    const dropzone = document.querySelector('.dropzone');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
            draggable.classList.add('dragging');
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
        });
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        let draggable = document.getElementById(id);

        // Determine if the dragged element is from the tool list or already in dropzone
        let isNewTool = !draggable.classList.contains('snapped');
        let clone;

        if (isNewTool) {
            // Clone tool from tool list
            clone = draggable.cloneNode(true);
            clone.id = `tool-${Date.now()}`; // Unique ID
            dropzone.appendChild(clone);
            draggable = clone;
        }

        // Get drop position relative to dropzone
        const dropzoneRect = dropzone.getBoundingClientRect();
        let x = e.clientX - dropzoneRect.left - draggable.offsetWidth / 2;
        let y = e.clientY - dropzoneRect.top - draggable.offsetHeight / 2;

        // Find nearby tools for snapping
        const snappedTools = dropzone.querySelectorAll('.tool.snapped:not(.dragging)');
        let minDistance = Infinity;
        let snapX = x;
        let snapY = y;
        const snapThreshold = 20; // Pixels within which snapping occurs

        snappedTools.forEach(tool => {
            if (tool !== draggable) {
                const toolRect = tool.getBoundingClientRect();
                const toolX = toolRect.left - dropzoneRect.left;
                const toolY = toolRect.top - dropzoneRect.top;
                const toolRight = toolX + tool.offsetWidth;
                const toolBottom = toolY + tool.offsetHeight;

                // Check possible snap points (right, left, top, bottom)
                const snapPoints = [
                    { x: toolRight, y: toolY, dist: Math.abs(x - toolRight) + Math.abs(y - toolY) }, // Snap to right
                    { x: toolX - draggable.offsetWidth, y: toolY, dist: Math.abs(x - (toolX - draggable.offsetWidth)) + Math.abs(y - toolY) }, // Snap to left
                    { x: toolX, y: toolBottom, dist: Math.abs(x - toolX) + Math.abs(y - toolBottom) }, // Snap to bottom
                    { x: toolX, y: toolY - draggable.offsetHeight, dist: Math.abs(x - toolX) + Math.abs(y - (toolY - draggable.offsetHeight)) } // Snap to top
                ];

                snapPoints.forEach(point => {
                    if (point.dist < minDistance && point.dist < snapThreshold) {
                        minDistance = point.dist;
                        snapX = point.x;
                        snapY = point.y;
                    }
                });
            }
        });

        // Apply snapped position
        draggable.classList.add('snapped');
        draggable.style.left = `${snapX}px`;
        draggable.style.top = `${snapY}px`;

        // Update dropzone style
        dropzone.classList.add('snapped');

        // Attach drag events to new clone
        if (isNewTool) {
            draggable.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', draggable.id);
                draggable.classList.add('dragging');
            });

            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
            });
        }
    });
});