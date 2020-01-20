import { post } from '@/utils/api'

// cluster查询
export const getCluster = data => post('cfg_db/cluster/query', data)
// {
//   "cfgDbPrimaryKeys": [
//       {
//           "productId": "test",
//           "stepId": "test"
//       }
//   ]
// }
// cluster更新
export const updateCluster = data => post('cfg_db/cluster/edit', data)
// {
//   "cfgClusterDefinitions": [
//       {
//           "productId": "test",
//           "stepId": "test",
//           "technology": "T1",
//           "distance": "5000",
//           "minimalCnt": "10",
//           "createBy": "xrj",
//           "remarks": null,
//           "updateTm": null
//       }
//   ]
// }

// add 查询
export const getAdder = data => post('cfg_db/adder/query', data)
// {
//   "cfgDbPrimaryKeys": [
//       {
//           "productId": "test",
//           "stepId": "test"
//       }
//   ]
// }
// add 更新
export const updateAdder = data => post('cfg_db/adder/edit', data)
// {
//   "cfgAdders": [
//       {
//           "productId": "test",
//           "stepId": "test",
//           "technology": "T1",
//           "tolerance": "100",
//           "createBy": "XRJ",
//           "remarks": null,
//           "updateTm": null
//       }
//   ]
// }
// zone 查询
export const getZone = data => post('cfg_db/zone/query', data)
// {
//   "cfgDbPrimaryKeys": [
//       {
//           "productId": "default",
//           "stepId": "default"
//       }
//   ]
// }
// zone 更新
export const updateZone = data => post('cfg_db/zone/edit', data)

// {
// 	"cfgZoneDefinitions":[
// 		{
//             "productId": "default",
//             "stepId": "default",
//             "technology": "default",
//             "zones": [
//                 {
//                     "zoneName": "a",
//                     "radius": "0-100000",
//                     "central": "315-45"
//                 },
//                 {
//                     "zoneName": "b",
//                     "radius": "0-100000",
//                     "central": "45-135"
//                 },
//                 {
//                     "zoneName": "c",
//                     "radius": "0-100000",
//                     "central": "135-225"
//                 },
//                 {
//                     "zoneName": "d",
//                     "radius": "100000-120000",
//                     "central": "315-45"
//                 },
//                 {
//                     "zoneName": "e",
//                     "radius": "100000-120000",
//                     "central": "45-135"
//                 },
//                 {
//                     "zoneName": "f",
//                     "radius": "100000-120000",
//                     "central": "135-225"
//                 },
//                 {
//                     "zoneName": "g",
//                     "radius": "100000-120000",
//                     "central": "225-315"
//                 },
//                 {
//                     "zoneName": "h",
//                     "radius": "120000-150000",
//                     "central": "315-45"
//                 },
//                 {
//                     "zoneName": "i",
//                     "radius": "120000-150000",
//                     "central": "45-135"
//                 },
//                 {
//                     "zoneName": "j",
//                     "radius": "120000-150000",
//                     "central": "135-225"
//                 },
//                 {
//                     "zoneName": "k",
//                     "radius": "120000-150000",
//                     "central": "225-315"
//                 }
//             ],
//             "createBy": "XRJ",
//             "remarks": null,
//             "updateTm": null
//         }
// 		]
// }
// sub_die查询
export const getSubDie = data => post('cfg_db/sub_die/query', data)
// {
//   "cfgDbPrimaryKeys": [
//       {
//           "productId": "default",
//           "stepId": "default"
//       }
//   ]
// }
// sub_die更新
export const updateSubDie = data => post('cfg_db/sub_die/edit', data)
// {
//   "cfgSubDies": [
//       {
//           "productId": "test",
//           "stepId": "test",
//           "technology": "T1",
//           "subDieIds": [
//               {
//                   "subDieId": 1,
//                   "subDieName": "testSubDieNameOne",
//                   "startX": 1000,
//                   "endX": 5000,
//                   "startY": 1000,
//                   "endY": 5000
//               }
//           ],
//           "createBy": "XRJ",
//           "remarks": null,
//           "updateTm": null
//       }
//   ]
// }
// repeater查询
export const getRepeater = data => post('cfg_db/repeater/query', data)
// {
//   "cfgDbPrimaryKeys": [
//       {
//           "productId": "default",
//           "stepId": "default"
//       }
//   ]
// }
// repeater更新
export const updateRepeater = data => post('cfg_db/repeater/edit', data)
// {
// 	"cfgRepeaters":[
// 		{
// 			"technology": null,
//             "productId": "test",
//             "stepId": "test",
//             "reticleSize": "2*2",
//             "originalReticleDie": "0,0",
//             "tolerance": "10",
//             "dieCount": "20",
//             "createBy": null,
//             "remarks": null,
//             "updateTm": null
// 		}
// 		]
// }
