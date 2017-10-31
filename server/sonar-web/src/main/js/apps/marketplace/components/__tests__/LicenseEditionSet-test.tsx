/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
/* eslint-disable import/order */
import * as React from 'react';
import { shallow } from 'enzyme';
import { change } from '../../../../helpers/testUtils';
import LicenseEditionSet from '../LicenseEditionSet';

jest.mock('../../../../api/marketplace', () => ({
  getLicensePreview: jest.fn(() =>
    Promise.resolve({ nextEditionKey: 'foo', previewStatus: 'NO_INSTALL' })
  ),
  getFormData: jest.fn(() => Promise.resolve({ serverId: 'foo', ncloc: 1000 }))
}));

jest.mock('lodash', () => {
  const lodash = require.requireActual('lodash');
  lodash.debounce = (fn: Function) => (...args: any[]) => fn(args);
  return lodash;
});

const getLicensePreview = require('../../../../api/marketplace').getLicensePreview as jest.Mock<
  any
>;

const DEFAULT_EDITION = {
  key: 'foo',
  name: 'Foo',
  textDescription: 'Foo desc',
  downloadUrl: 'download_url',
  homeUrl: 'more_url',
  requestUrl: 'license_url'
};

beforeEach(() => {
  getLicensePreview.mockClear();
});

it('should display correctly', () => {
  expect(getWrapper()).toMatchSnapshot();
});

it('should display the get license link with parameters', async () => {
  const wrapper = getWrapper();
  await new Promise(setImmediate);
  wrapper.update();
  expect(wrapper.find('a')).toMatchSnapshot();
});

it('should correctly display status message after checking license', async () => {
  await testLicenseStatus('NO_INSTALL');
  await testLicenseStatus('AUTOMATIC_INSTALL');
  await testLicenseStatus('MANUAL_INSTALL');
});

function getWrapper(props = {}) {
  return shallow(
    <LicenseEditionSet
      edition={DEFAULT_EDITION}
      editions={[DEFAULT_EDITION]}
      updateLicense={jest.fn()}
      {...props}
    />
  );
}

async function testLicenseStatus(status: string) {
  getLicensePreview.mockImplementation(() =>
    Promise.resolve({ nextEditionKey: 'foo', previewStatus: status })
  );
  const updateLicense = jest.fn();
  const wrapper = getWrapper({ updateLicense });
  change(wrapper.find('textarea'), 'mylicense');
  expect(getLicensePreview).toHaveBeenCalled();
  await new Promise(setImmediate);
  expect(updateLicense).toHaveBeenCalled();
  wrapper.update();
  expect(wrapper.find('p.alert')).toMatchSnapshot();
}
