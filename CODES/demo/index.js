/*
 * @Author: Lee
 * @Date: 2021-12-05 17:09:33
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-05 17:46:47
 */


// init instance
const canvas = document.querySelector("#canvas");
const context = canvas.getContext('2d');

context.shadowColor = 'color';
context.shadowBlur = '30px';
context.shadowOffsetX = 10;
context.shadowOffsetY = 10;

context.font = '40pt Arial';
context.strokeStyle = 'red';
context.textAlign='left';
context.textBaseline = 'top'
context.strokeText('China', 0, 0, 100);


