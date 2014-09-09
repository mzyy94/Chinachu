// # Chinachu Common Module (chinachu-akari)

/// <reference path="ref/node.d.ts"/>
'use strict';

var CONFIG_PATH = process.env.CHINACHU_CONFIG_PATH || 'config.json';
var RULES_PATH  = process.env.CHINACHU_RULES_PATH  || 'rules.json';
var DATA_DIR    = process.env.CHINACHU_DATA_DIR    || 'data/';

var RESERVES_DATA_PATH = DATA_DIR + 'reserves.json';
var RECORDS_DATA_PATH  = DATA_DIR + 'records.json';
var SCHEDULE_DATA_PATH = DATA_DIR + 'schedule.json';

import fs      = require('fs');
import util    = require('util');
var dateFormat = require('dateformat');
var execSync   = require('execsync');

export enum ECategory {
    anime = 0,
    information = 1,
    news = 2,
    sports = 3,
    variety = 4,
    drama = 5,
    music = 6,
    cinema = 7,
    etc = 8,
    various = 100,
    radio = 200
}

export enum EChannelType {
    GR = 0,
    BS = 10,
    CS = 20,
    EX = 100,
    IR = 200
}

export enum EMediaContainer {
    'MPEG-2 TS' = 0,
    'MPEG-4' = 1,
    WebM = 2
}

export enum EVideoType {
    'MPEG-4 AVC' = 0,
    'MPEG-4 Part 2' = 1,
    'MPEG-2' = 2,
    VP9 = 3,
    VP8 = 4
}

export enum EAudioType {
    AAC = 0,
    Vorbis = 1,
    MP3 = 2
}

export enum ERecordingOption {
    '1seg' = 0,
    norec = 1,
    freetime = 2
}

export enum EDay {
    sun = 0,
    mon = 1,
    tue = 2,
    wed = 3,
    thu = 4,
    fri = 5,
    sat = 6
}

export enum EProgramTaskType {
    encode = 0,
    script = 1,
    cmcut = 2
}

export enum EProgramTaskOption {
    unchain = 0,
    async = 1
}

export enum EProgramTaskStatus {
    running = 1,
    completed = 2,
    failed = 3,
    pausing = 4
}

export interface ILogLevel {
    level: number;
    label: string;
    isStderr?: boolean;
}

export interface IChannel {
    n: number;
    id: string;
    sid?: string;
    channel: string;
    name: string;
    type: EChannelType;
    isDisabled?: boolean;
}

export interface ITuner {
    name: string;
    types: EChannelType[];
    command: string;
    isScrambling: boolean;
    group?: string;
    isDisabled?: boolean;
}

export interface ITunerGroup {
    controlWait?: number;
}

export interface IProgram {
    id: string;
    start: number;
    end: number;
    seconds: number;
    channel: IChannel;
    category: ECategory;
    flags: string[];
    episode: number;
    title: string;
    subTitle: string;
    fullTitle: string;
    detail: string;
    priority?: number;
    recorded?: string;
    command?: string;
    tuner?: ITuner;
    rule?: IRule;
    tasks?: IProgramTask[];
    transcoder?: ITranscoder;
    mediaInfo?: IMediaInfo;
    recordingOptions?: ERecordingOption[];
    isManualReserved?: boolean;
    isConflict?: boolean;
    source?: IProgram;
}

export interface IProgramTask {
    type: EProgramTaskType;
    options?: EProgramTaskOption[];
    status?: EProgramTaskStatus;
    removeSource?: boolean;
    transcoder?: ITranscoder;
    script?: string;
    nice?: number;
}

export interface ITranscoder {
    name: string;
    video?: IVideoSpec;
    audio?: IAudioSpec;
}

export interface IMediaInfo {
    start?: number;
    end?: number;
    seconds?: number;
    size?: number;
    bitrate?: number;
    container?: EMediaContainer;
    video?: IVideoSpec;
    audios?: IAudioSpec[];
}

export interface IVideoSpec {
    type?: EVideoType;
    bitrate?: number;
    width?: number;
    height?: number;
    fps?: number;
    par?: number;
    dar?: number;
    preset?: string;
    crf?: number;
}

export interface IAudioSpec {
    type?: EAudioType;
    bitrate?: number;
    channel?: number;
    frequency?: number;
}

export interface IRule {
    id: string;
    priority?: number;
    name?: string;
    types?: EChannelType[];
    categories?: ECategory[];
    channels?: string[];
    ignore_channels?: string[];
    reserve_flags?: string[];
    ignore_flags?: string[];
    hour?: {
        start?: number;
        end?: number;
    };
    duration?: {
        min?: number;
        max?: number;
    };
    freetime?: {
        start: number;
        end: number;
    };
    days?: EDay[];
    reserve_titles?: string[];
    ignore_titles?: string[];
    reserve_descriptions?: string[];
    ignore_descriptions?: string[];
    recordingOptions?: ERecordingOption[];
    tasks?: IProgramTask[];
    isDisabled?: boolean;
}

export var LOG_ERROR: ILogLevel = {
    level: 0,
    label: 'error',
    isStderr: true
};
export var LOG_WARN: ILogLevel = {
    level: 1,
    label: 'warn',
    isStderr: true
};
export var LOG_INFO: ILogLevel = {
    level: 2,
    label: 'info'
};
export var LOG_DEBUG: ILogLevel = {
    level: 3,
    label: 'debug'
};

export function log(level: ILogLevel, message: string): void {

    message = new Date().toISOString() + ' ' + level.label + ' - ' + message;

    if (level.isStderr === true) {
        process.stderr.write(message + '\n');
    } else {
        process.stdout.write(message + '\n');
    }
};

export function jsonWatcher(filepath: string, callback: (error?: string, data?: any, message?: string) => void, option: any) {

    if (typeof option === 'undefined') { option = {}; }

    option.wait = option.wait || 1000;

    if (!fs.existsSync(filepath)) {
        if (option.create) {
            fs.writeFileSync(filepath, JSON.stringify(option.create));
        } else {
            callback('FATAL: `' + filepath + '` is not exists.', null, null);
            return;
        }
    }

    var data = null;

    var parse = function (err, json) {
        if (err) {
            callback('WARN: Failed to read `' + filepath + '`. (' + err + ')', null, null);
        } else {
            data = null;

            try {
                data = JSON.parse(json);
                callback(null, data, 'READ: `' + filepath + '` is updated.');
            } catch (e) {
                callback('WARN: `' + filepath + '` is invalid. (' + e + ')', null, null);
            }
        }
    };

    var timer = null;

    var read = function () {
        timer = null;

        fs.readFile(filepath, { encoding: 'utf8' }, parse);
    };

    if (option.now) { read(); }

    var onUpdated = function () {
        if (timer !== null) { clearTimeout(timer); }
        timer = setTimeout(read, option.wait);
    };
    fs.watch(filepath, onUpdated);
};

export function getProgramById(id: string, array: any[]): IProgram {

    if (!array || array.length === 0) {
        return null;
    }

    if (array[0].programs) {
        array = (function () {
            var programs = [];

            array.forEach(function (ch) {
                programs = programs.concat(ch.programs);
            });

            return programs;
        }());
    }

    return (function () {
        var x = null;

        array.forEach(function (a) {
            if (a.id === id) { x = a; }
        });

        return x;
    }());
};

export function existsTuner(tuners: ITuner[], type: EChannelType, callback: (boolean) => void): void {

    process.nextTick(function () {
        callback(exports.existsTunerSync(tuners, type));
    });
};

export function existsTunerSync(tuners: ITuner[], type: EChannelType): boolean {

    var i, tuner, isExists = false;

    for (i = 0; tuners.length > i; i++) {
        tuner = tuners[i];

        if (tuner.types.indexOf(type) !== -1) {
            isExists = true;
            break;
        }
    }

    return isExists;
};

export function getFreeTunerSync(tuners: ITuner[], type: EChannelType): ITuner {

    var i, exists, pid, tuner: ITuner, freeTuner = null;

    for (i = 0; tuners.length > i; i++) {
        tuner = tuners[i];

        if (tuner.types.indexOf(type) === -1) {
            continue;
        }

        if (fs.existsSync('./data/tuner.' + tuner.name + '.lock') === true) {
            pid = fs.readFileSync('./data/tuner.' + tuner.name + '.lock', { encoding: 'utf8' });
            pid = pid.trim();

            if (pid === '') {
                continue;
            }

            if (execSync('kill -0 ' + pid) !== '') {
                exports.unlockTunerSync(tuner);
                freeTuner = tuner;
                break;
            }
        } else {
            freeTuner = tuner;
            break;
        }
    }

    return freeTuner;
};

export function lockTuner(tuner: ITuner, callback: (error) => void): void {
    fs.writeFile('./data/tuner.' + tuner.name + '.lock', process.pid, { flag: 'wx' }, callback);
};

export function lockTunerSync(tuner: ITuner): void {
    try {
        return fs.writeFileSync('./data/tuner.' + tuner.name + '.lock', process.pid, { flag: 'wx' });
    } catch (e) {
        throw e;
    }
};

export function unlockTune(tuner: ITuner, callback: (error) => void): void {
    fs.unlink('./data/tuner.' + tuner.name + '.lock', callback);
};

export function unlockTunerSync(tuner: ITuner, safe: boolean): void {
    try {
        if (safe === true) {
            var pid = fs.readFileSync('./data/tuner.' + tuner.name + '.lock', { encoding: 'utf8' });
            if (pid !== '') {
                if (execSync('kill -0 ' + pid) === '') {
                    return null;
                } else {
                    return fs.unlinkSync('./data/tuner.' + tuner.name + '.lock');
                }
            }
        }
        return fs.unlinkSync('./data/tuner.' + tuner.name + '.lock');
    } catch (e) {
        throw e;
    }
};

export function writeTunerPid(tuner: ITuner, pid: number, callback: (error) => void): void {
    fs.writeFile('./data/tuner.' + tuner.name + '.lock', pid, { flag: 'w' }, callback);
};

export function writeTunerPidSync(tuner: ITuner, pid: number): void {
    try {
        return fs.writeFileSync('./data/tuner.' + tuner.name + '.lock', pid, { flag: 'w' });
    } catch (e) {
        throw e;
    }
};

var Countdown = function (count, callback) {
    this.c = count;
    this.f = callback;
};

Countdown.prototype = {
    tick: function () {

        --this.c;

        if (this.c === 0) {
            this.f();
        }

        return this;
    }
};

export function createCountdown(a, b) {
    return new Countdown(a, b);
};

export function createTimeout(a, b: number): any {
    return function () {
        return setTimeout(a, b);
    };
};

export function formatRecordedName(program: IProgram, name: string): string {
    name = name.replace(/<([^>]+)>/g, function (z, a) {

        // date:
        if (a.match(/^date:.+$/) !== null) { return dateFormat(new Date(program.start), a.match(/:(.+)$/)[1]); }

        // id
        if (a.match(/^id$/) !== null) { return program.id; }

        // type
        if (a.match(/^type$/) !== null) { return program.channel.type; }

        // channel
        if (a.match(/^channel$/) !== null) { return program.channel.channel; }

        // channel-id
        if (a.match(/^channel-id$/) !== null) { return program.channel.id; }

        // channel-sid
        if (a.match(/^channel-sid$/) !== null) { return program.channel.sid; }

        // channel-name
        if (a.match(/^channel-name$/) !== null) { return exports.stripFilename(program.channel.name); }

        // tuner
        if (a.match(/^tuner$/) !== null) { return program.tuner.name; }

        // title
        if (a.match(/^title$/) !== null) { return exports.stripFilename(program.title); }

        // fulltitle
        if (a.match(/^fulltitle$/) !== null) { return exports.stripFilename(program.fullTitle || ''); }

        // subtitle
        if (a.match(/^subtitle$/) !== null) { return exports.stripFilename(program.subTitle || ''); }

        // episode
        if (a.match(/^episode$/) !== null) { return program.episode || 'n'; }

        // category
        if (a.match(/^category$/) !== null) { return program.category; }
    });

    return name;
};

// strip
export function stripFilename(a: string): string {

    a = a.replace(/\//g, '／').replace(/\\/g, '＼').replace(/:/g, '：').replace(/\*/g, '＊').replace(/\?/g, '？');
    a = a.replace(/"/g, '”').replace(/</g, '＜').replace(/>/g, '＞').replace(/\|/g, '｜').replace(/≫/g, '＞＞');

    return a;
};

export function isMatchedProgram(rules: IRule[], program: IProgram): boolean {

    var result = false;

    rules.forEach(function (rule) {

        var i, j, l, m, isFound;

        // isDisabled
        if (rule.isDisabled) { return; }

        // types
        if (rule.types) {
            if (rule.types.indexOf(program.channel.type) === -1) { return; }
        }

        // channels
        if (rule.channels) {
            if (rule.channels.indexOf(program.channel.id) === -1) {
                if (rule.channels.indexOf(program.channel.channel) === -1) {
                    return;
                }
            }
        }

        // ignore_channels
        if (rule.ignore_channels) {
            if (rule.ignore_channels.indexOf(program.channel.id) !== -1) {
                return;
            }
            if (rule.ignore_channels.indexOf(program.channel.channel) !== -1) {
                return;
            }
        }

        // categories
        if (rule.categories) {
            if (rule.categories.indexOf(program.category) === -1) { return; }
        }

        // hour
        if (rule.hour && (typeof rule.hour.start !== 'undefined') && (typeof rule.hour.end !== 'undefined')) {
            var ruleStart = rule.hour.start;
            var ruleEnd   = rule.hour.end;

            var progStart = new Date(program.start).getHours();
            var progEnd   = new Date(program.end).getHours();

            if (progStart > progEnd) {
                progEnd += 24;
            }

            if (ruleStart > ruleEnd) {
                if ((ruleStart > progStart) && (ruleEnd < progEnd)) { return; }
            } else {
                if ((ruleStart > progStart) || (ruleEnd < progEnd)) { return; }
            }
        }

        // duration
        if (rule.duration && (typeof rule.duration.min !== 'undefined') && (typeof rule.duration.max !== 'undefined')) {
            if ((rule.duration.min > program.seconds) || (rule.duration.max < program.seconds)) { return; }
        }

        // days
        if (rule.days) {
            if (rule.days.indexOf(new Date(program.start).getDay()) === -1) { return; }
        }

        // reserve_titles
        if (rule.reserve_titles) {
            isFound = false;

            for (i = 0, l = rule.reserve_titles.length; i < l; i++) {
                if (program.fullTitle.match(rule.reserve_titles[i]) !== null) { isFound = true; }
            }

            if (!isFound) { return; }
        }

        // ignore_titles
        if (rule.ignore_titles) {
            for (i = 0, l = rule.ignore_titles.length; i < l; i++) {
                if (program.fullTitle.match(rule.ignore_titles[i]) !== null) { return; }
            }
        }

        // reserve_descriptions
        if (rule.reserve_descriptions) {
            if (!program.detail) { return; }

            isFound = false;

            for (i = 0, l = rule.reserve_descriptions.length; i < l; i++) {
                if (program.detail.match(rule.reserve_descriptions[i]) !== null) { isFound = true; }
            }

            if (!isFound) { return; }
        }

        // ignore_descriptions
        if (rule.ignore_descriptions) {
            if (!program.detail) { return; }
            
            for (i = 0, l = rule.ignore_descriptions.length; i < l; i++) {
                if (program.detail.match(rule.ignore_descriptions[i]) !== null) { return; }
            }
        }

        // ignore_flags
        if (rule.ignore_flags) {
            for (i = 0, l = rule.ignore_flags.length; i < l; i++) {
                for (j = 0, m = program.flags.length; j < m; j++) {
                    if (rule.ignore_flags[i] === program.flags[j]) { return; }
                }
            }
        }

        // reserve_flags
        if (rule.reserve_flags) {
            if (!program.flags) { return; }

            isFound = false;

            for (i = 0, l = rule.reserve_flags.length; i < l; i++) {
                for (j = 0, m = program.flags.length; j < m; j++) {
                    if (rule.reserve_flags[i] === program.flags[j]) { isFound = true; }
                }
            }

            if (!isFound) { return; }
        }

        result = true;

    });

    return result;
};
