export enum EventTypeEnum {
    live = 'live',
    liveTourFirst = 'live_tour_first',
    liveTourMiddle = 'live_tour_middle',
    liveTourFinal = 'live_tour_final',
    liveAdditional = 'live_additional',
    fanMeeting = 'fan_meeting',
    miniLive = 'mini_live',
    /**
     * 拼盘 live，优先级不固定
     */
    fesLive = 'fes_live',
    releaseEvent = 'release_event',
    animeOnAir = 'anime_on_air',
    characterBirthday = 'character_birthday',
    projectPromulgate = 'project_promulgate',
    /**
     * 生放送
     */
    liveStream = 'live_stream',
    personBirthday = 'person_birthday',
    personEvent = 'person_event',
    /**
     * 地上波
     */
    tvProgramOnAir = 'tv_program_on_air',
    goodsRelease = 'goods_release',
    /**
     * 特殊类
     */
    specialEvent0 = 'special_event_0',
    specialEvent1 = 'special_event_1',
    // 比如联动、比如合作，公开了新的版权绘
    speicalEventWithPhoto = 'special_event_with_new_photo'
}
