/**
 * Служба для регистрации сообщений в документе `Google Sheets`.
 * @class               SheetLog
 * @namespace           SheetLog
 * @extends             Sheet
 * @version             1.1.0
 * @author              Maksym Stoianov <stoianov.maksym@gmail.com>
 * @license             MIT
 * @tutorial            https://maksymstoianov.com/
 * @see                 [GitHub](https://github.com/MaksymStoianov/SheetLog)
 * 
 * #### Example
 * ```javascript
 * const logger = new SheetLog('sheetName');
 * 
 * logger.log('Hello');
 * logger.log('Hello', 'Maksym');
 * logger.log('Hello', 1, { key: 'Maksym' });
 * logger.log('Hello %s !', 'Maksym');
 * logger.log('stoianov.maksym@gmail.com', 'Hello %s !', 'Maksym');
 */
// TODO Автоматически определить тип логирования, если передан объект `Error` или extends от него.
// TODO Вывод в `console` и/или `Logger`.
class SheetLog extends Sheet {

  /**
   * Проверяет, является ли заданное значение объектом типа [`SheetLog`](#).
   * @param {*} input Значение для проверки.
   * @return {boolean}
   */
  static isSheetLog(input) {
    if (!arguments.length) {
      throw new Error(`The parameters () don't match any method signature for ${this.name}.isSheetLog.`);
    }

    return (input instanceof this);
  }



  /**
   * Проверяет, является ли значение допустимым адресом электронной почты.
   * @param {*} input Значение для проверки.
   * @return {boolean}
   */
  static isEmail(input) {
    if (!arguments.length) {
      throw new Error(`The parameters () don't match any method signature for ${this.name}.isEmail.`);
    }

    const regExp = /^[a-z0-9]+[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

    return regExp.test(input);
  }



  /**
   * Добавляет сообщение в таблицу.
   * @private
   * @param {Array} messages
   * @param {string} [level = 'log'] Уровень журнала.
   */
  _appendRow(messages, level = 'log') {
    if (!(Array.isArray(messages) && messages.length)) {
      throw new TypeError('At least one event message must be provided');
    }

    const timestamp = Utilities.formatDate(new Date(), Session.getTimeZone(), `yyyy-MM-dd HH:mm:ss`);

    let user = null;

    // Если первое сообщение является строкой и содержит email
    if (typeof messages[0] === 'string' && this.constructor.isEmail(messages[0])) {
      user = messages.shift();
    } else {
      user = Session?.getActiveUser()?.getEmail();
    }

    let message = null;

    // Если первое сообщение является строкой и содержит маски, применяем Utilities.formatString
    if (messages.length > 1 && typeof messages[0] === 'string' && /%[sdj]/.test(messages[0])) {
      message = Utilities.formatString(...messages);
    } else {
      message = messages
        .map(msg => typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg)
        .join('\n');
    }
    
    this.appendRow([
      timestamp,
      level,
      user,
      message
    ]);

    return this;
  }



  /**
   * Записывает сообщения, содержащие некоторую информацию, в журнал.
   * В Google Таблице, рядом с этими элементами на листе отображается надпись "log".
   */
  log(...args) {
    return this._appendRow(args, 'log');
  }



  /**
   * Записывает сообщения, содержащие некоторую информацию, в журнал.
   * В Google Таблице, рядом с этими элементами на листе отображается надпись "info".
   */
  info(...args) {
    return this._appendRow(args, 'info');
  }



  /**
   * Записывает сообщения, содержащие некоторую информацию, в журнал.
   * В Google Таблице, рядом с этими элементами на листе отображается надпись "warn".
   */
  warn(...args) {
    return this._appendRow(args, 'warn');
  }



  /**
   * Записывает сообщения, содержащие некоторую информацию, в журнал.
   * В Google Таблице, рядом с этими элементами на листе отображается надпись "error".
   */
  error(...args) {
    return this._appendRow(args, 'error');
  }



  /**
   * Очищает лист журнала.
   */
  clear() {
    return this.deleteRows(() => true);
  }



  /**
   * Извлекает все записи журнала из листа.
   * @param {Object} [options = {}] Смотри `Sheet.getValues()`.
   * @return {(Array|Object)}
   */
  getLog(options = {}) {
    return this.getValues(options);
  }

}
