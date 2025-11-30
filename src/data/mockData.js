// src/data/mockData.js
export const furnitureModels = {
  control: [
    {
      id: 'control_cube',
      name: 'Color-only Cube',
      type: 'control',
      geometry: 'cube',
      materials: [
        { color: '#ff0000' }, // Red
        { color: '#00ff00' }, // Green
        { color: '#0000ff' }  // Blue
      ]
    }
  ],
  intervention: [
    {
      id: 'intervention_cube',
      name: 'Textured Cube',
      type: 'intervention',
      geometry: 'cube',
      materials: [
        { color: '#ff0000', texture: 'stripes' },
        { color: '#00ff00', texture: 'dots' },
        { color: '#0000ff', texture: 'grid' }
      ]
    }
  ]
};

export const studyTasks = [
  {
    id: 'task_1',
    description: 'Identify the top drawer',
    instructions: 'Click on the topmost drawer in the cabinet',
    targetComponent: 'drawer_top',
    maxTime: 30000 // 30 seconds
  }
];